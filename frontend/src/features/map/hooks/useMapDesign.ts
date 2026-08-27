"use client";

// 지도 서버 상태(채움·스티커·사진 카드)의 단일 출처.
// 컴포넌트는 스토어가 아니라 이 훅들에서 읽는다 — decorateStore 는 UI 상태(도구/선택)만 들고 있다.
//
// 이 파일이 서버 DTO ↔ 화면 표현형(@/types/map) 변환을 전담한다. 컴포넌트가 posX/scale 같은
// 서버 필드를 직접 보지 않게 해서, 계약이 바뀌어도 매퍼만 고치면 되게 한다.
import { useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PlacedPhotoCard, PlacedSticker, RegionFill } from "@/types/map";
import { getAccessToken } from "@/lib/api/client";
import {
  addEupmyeondongMapSticker,
  addEupmyeondongMapTravelPost,
  fillEupmyeondongMap,
  fillSigunguMap,
  getEupmyeondongMapDesign,
  getEupmyeondongMapStickers,
  getEupmyeondongMapTravelPosts,
  getSigunguMapDesign,
  getStickers,
  updateEupmyeondongMapFill,
  updateSigunguMapFill,
} from "../api/mapApi";
import {
  clampPhotoCardWidth,
  clampStickerSize,
  DEFAULT_PHOTO_CARD_WIDTH,
  DEFAULT_STICKER_SIZE,
} from "../store/decorateStore";
import { stickerNameByUrl } from "../stickers";
import { mapKeys } from "./queryKeys";
import type {
  EmdFillResponse,
  EupmyeondongCode,
  FillType,
  ListResult,
  MapStickerResponse,
  MapTravelPostResponse,
  SigunguCode,
  SigunguFillResponse,
  StickerResponse,
} from "../types";

/**
 * ⚠️ 확인 필요 — 읍면동 식별자.
 * 서버 `EmdFillRequest.emdId` 는 int64 이고, 응답에도 emdId 만 오고 동 이름·코드가 없다.
 * 프론트 폴리곤 식별자는 행정동코드 10자리(adm_cd2, 예: 5111025000)라, 지금은 둘이 같은 값이라고
 * 보고 숫자 변환만 한다. (시군구가 int32, 읍면동이 int64 인 것도 10자리 코드와 아귀가 맞는다.)
 * emdId 가 DB 시퀀스 id 라면 코드↔id 대응표가 필요하다 — 그때 이 두 함수만 고치면 된다.
 */
function toEmdId(code: EupmyeondongCode): number {
  return Number(code);
}
function toEmdCode(emdId: number): EupmyeondongCode {
  return String(emdId);
}

/** 낙관적 업데이트로 먼저 그려둔(아직 서버 id 가 없는) 채움 표시. */
const PENDING_FILL_MAP_ID = -1;

// ─── 매퍼: 서버 ↔ 화면 ────────────────────────────────────────────────────

interface FillFields {
  fillType: FillType;
  color: string | null;
  imgUrl: string | null;
}

/** 서버 채움 → 렌더러가 먹는 RegionFill. 색/URL이 비어 있으면 비움으로 떨어뜨린다. */
function toRegionFill(fill: FillFields): RegionFill {
  if (fill.fillType === "IMAGE" && fill.imgUrl) return { type: "photo", src: fill.imgUrl };
  if (fill.fillType === "COLOR" && fill.color) return { type: "color", value: fill.color };
  return { type: "empty" };
}

/** RegionFill → 서버 요청 본문. 비움은 보낼 수 없다(되돌리는 API가 없다). */
function toFillBody(fill: RegionFill): FillFields {
  if (fill.type === "color") return { fillType: "COLOR", color: fill.value, imgUrl: null };
  if (fill.type === "photo") return { fillType: "IMAGE", color: null, imgUrl: fill.src };
  throw new Error("빈 채움으로 되돌리는 API가 아직 없습니다.");
}

/** 채움 목록 → code별 채움 + fillMapId 색인(수정 시 PATCH 대상 식별에 쓴다). */
interface FillsView {
  fills: Record<string, RegionFill>;
  fillMapIdByCode: Record<string, number>;
}

function toFillsView<T extends FillFields & { fillMapId: number }>(
  list: ListResult<T>,
  codeOf: (item: T) => string,
): FillsView {
  const fills: Record<string, RegionFill> = {};
  const fillMapIdByCode: Record<string, number> = {};
  for (const item of list.content ?? []) {
    const code = codeOf(item);
    fills[code] = toRegionFill(item);
    fillMapIdByCode[code] = item.fillMapId;
  }
  return { fills, fillMapIdByCode };
}

/**
 * 서버 스티커 → 화면 스티커.
 * 서버는 크기를 scale(배율)로, 화면은 한 변 길이(viewBox 단위)로 다루므로 기본 크기를 곱한다.
 */
function toPlacedSticker(res: MapStickerResponse): PlacedSticker {
  return {
    id: String(res.mapStickerId),
    stickerId: String(res.stickerId ?? ""),
    src: res.stickerUrl ?? "",
    name: stickerNameByUrl(res.stickerUrl ?? ""),
    x: res.posX,
    y: res.posY,
    size: (res.scale || 1) * DEFAULT_STICKER_SIZE,
  };
}

function toPlacedPhotoCard(res: MapTravelPostResponse): PlacedPhotoCard {
  return {
    id: String(res.mapStickerId),
    recordId: String(res.travelPostId),
    src: res.firstImage ?? "",
    title: res.title ?? "",
    x: res.posX,
    y: res.posY,
    width: (res.scale || 1) * DEFAULT_PHOTO_CARD_WIDTH,
  };
}

// ─── 인증 게이트 ──────────────────────────────────────────────────────────

/**
 * 토큰 보유 여부. map-design 은 전부 인증 필수라, 비로그인 상태에서 401을 반복해 던지지 않도록
 * 쿼리를 꺼두는 데 쓴다. localStorage 는 서버 렌더에 없어서, 서버에서는 비로그인으로 본다.
 */
export function useHasToken(): boolean {
  return useSyncExternalStore(
    // 토큰이 바뀌는 순간(로그인/로그아웃)은 페이지 이동을 동반하므로 따로 구독하지 않는다.
    NO_SUBSCRIBE,
    () => getAccessToken() !== null,
    // 서버 스냅샷 — localStorage 가 없으니 항상 비로그인으로 본다.
    () => false,
  );
}

const NO_SUBSCRIBE = () => () => {};

// ─── 조회 ─────────────────────────────────────────────────────────────────

const EMPTY_FILLS: FillsView = { fills: {}, fillMapIdByCode: {} };
const EMPTY_STICKERS: PlacedSticker[] = [];
const EMPTY_PHOTO_CARDS: PlacedPhotoCard[] = [];
const EMPTY_CATALOG: StickerResponse[] = [];

/** 1단계(시군구) 채움. */
export function useSigunguFills() {
  const enabled = useHasToken();
  const query = useQuery({
    queryKey: mapKeys.sigunguFills(),
    queryFn: getSigunguMapDesign,
    enabled,
    select: (data: ListResult<SigunguFillResponse>) =>
      toFillsView(data, (item) => String(item.sigunguCd)),
  });
  return { ...query, data: query.data ?? EMPTY_FILLS };
}

/** 2단계(읍면동) 채움. 시군구에 들어가 있을 때만 조회한다. */
export function useEupmyeondongFills(sigunguCd: SigunguCode | null) {
  const hasToken = useHasToken();
  const query = useQuery({
    queryKey: mapKeys.emdFills(sigunguCd ?? ""),
    queryFn: () => getEupmyeondongMapDesign(sigunguCd as string),
    enabled: hasToken && sigunguCd !== null,
    select: (data: ListResult<EmdFillResponse>) =>
      toFillsView(data, (item) => toEmdCode(item.emdId)),
  });
  return { ...query, data: query.data ?? EMPTY_FILLS };
}

/**
 * 지금 보고 있는 단계의 채움.
 * 1단계면 시군구 채움, 2단계면 그 시군구의 읍면동 채움 — 화면은 "이 지도의 채움"만 알면 된다.
 * (두 훅을 다 부르지만 꺼진 쪽은 요청이 나가지 않는다 — enabled 로 막혀 있다.)
 */
export function useActiveFills(activeSigungu: SigunguCode | null) {
  const sigunguFills = useSigunguFills();
  const emdFills = useEupmyeondongFills(activeSigungu);
  return activeSigungu === null ? sigunguFills : emdFills;
}

/** 스티커 카탈로그(시트에 뿌릴 목록). */
export function useStickerCatalog() {
  const enabled = useHasToken();
  const query = useQuery({
    queryKey: mapKeys.stickerCatalog(),
    queryFn: getStickers,
    enabled,
    // 카탈로그는 사용자와 무관하고 잘 바뀌지 않는다.
    staleTime: 30 * 60_000,
    select: (data: ListResult<StickerResponse>) => data.content ?? EMPTY_CATALOG,
  });
  return { ...query, data: query.data ?? EMPTY_CATALOG };
}

/** 지도에 놓인 스티커. */
export function useMapStickers(sigunguCd: SigunguCode | null) {
  const hasToken = useHasToken();
  const query = useQuery({
    queryKey: mapKeys.stickers(sigunguCd ?? ""),
    queryFn: () => getEupmyeondongMapStickers(sigunguCd as string),
    enabled: hasToken && sigunguCd !== null,
    select: (data: ListResult<MapStickerResponse>) => (data.content ?? []).map(toPlacedSticker),
  });
  return { ...query, data: query.data ?? EMPTY_STICKERS };
}

/** 지도에 놓인 사진 카드. */
export function useMapPhotoCards(sigunguCd: SigunguCode | null) {
  const hasToken = useHasToken();
  const query = useQuery({
    queryKey: mapKeys.photoCards(sigunguCd ?? ""),
    queryFn: () => getEupmyeondongMapTravelPosts(sigunguCd as string),
    enabled: hasToken && sigunguCd !== null,
    select: (data: ListResult<MapTravelPostResponse>) =>
      (data.content ?? []).map(toPlacedPhotoCard),
  });
  return { ...query, data: query.data ?? EMPTY_PHOTO_CARDS };
}

// ─── 변경 ─────────────────────────────────────────────────────────────────

/** 낙관적 업데이트 때 캐시에 끼워 넣는 최소 형태(단계에 따라 sigunguCd 또는 emdId 를 갖는다). */
type CachedFill = FillFields & { fillMapId: number; sigunguCd?: number; emdId?: number };

/**
 * 지역 채우기. 1·2단계를 한 훅으로 묶는다 — 화면에서는 "고른 지역을 이 색/사진으로 채운다"는
 * 한 가지 동작이고, 어느 API 로 갈지는 activeSigungu 유무로만 갈리기 때문이다.
 *
 * 이미 채워진 지역이면 POST 대신 PATCH 로 간다(서버가 신규/수정을 나눠놨다).
 * 칠하는 순간 지도가 먼저 바뀌고(낙관적), 실패하면 되돌린다.
 */
export function useFillRegion(activeSigungu: SigunguCode | null) {
  const queryClient = useQueryClient();
  const queryKey = activeSigungu ? mapKeys.emdFills(activeSigungu) : mapKeys.sigunguFills();

  const matches = (item: CachedFill, code: string) =>
    activeSigungu === null ? String(item.sigunguCd) === code : toEmdCode(item.emdId ?? 0) === code;

  return useMutation({
    mutationFn: async ({ code, fill }: { code: string; fill: RegionFill }) => {
      const body = toFillBody(fill);
      const cached = queryClient.getQueryData<ListResult<CachedFill>>(queryKey);
      const existing = cached?.content?.find((item) => matches(item, code));
      // 낙관적으로 넣어둔 임시 레코드는 아직 서버에 없으니 PATCH 대상이 될 수 없다.
      const savedId =
        existing && existing.fillMapId !== PENDING_FILL_MAP_ID ? existing.fillMapId : null;

      if (activeSigungu === null) {
        const request = { sigunguCd: Number(code), ...body };
        return savedId === null ? fillSigunguMap(request) : updateSigunguMapFill(savedId, request);
      }
      return savedId === null
        ? fillEupmyeondongMap(activeSigungu, { emdId: toEmdId(code), ...body })
        : updateEupmyeondongMapFill(activeSigungu, savedId, body);
    },

    onMutate: async ({ code, fill }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ListResult<CachedFill>>(queryKey);
      const body = toFillBody(fill);
      const content = previous?.content ?? [];

      const next = content.some((item) => matches(item, code))
        ? content.map((item) => (matches(item, code) ? { ...item, ...body } : item))
        : [
            ...content,
            {
              fillMapId: PENDING_FILL_MAP_ID,
              ...(activeSigungu === null ? { sigunguCd: Number(code) } : { emdId: toEmdId(code) }),
              ...body,
            },
          ];

      queryClient.setQueryData<ListResult<CachedFill>>(queryKey, { content: next });
      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) queryClient.setQueryData(queryKey, context.previous);
    },

    // 성공이든 실패든 서버 값으로 맞춘다(임시 fillMapId 를 실제 id 로 바꿔 다음 수정이 PATCH 가 되게).
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}

/** 스티커 배치. zIndex 는 지금 놓인 것들 위로 올린다. */
export function usePlaceSticker(sigunguCd: SigunguCode | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { stickerId: number; x: number; y: number; size: number }) => {
      if (!sigunguCd) throw new Error("시군구가 선택되지 않았습니다.");
      const cached = queryClient.getQueryData<ListResult<MapStickerResponse>>(
        mapKeys.stickers(sigunguCd),
      );
      const topZ = Math.max(0, ...(cached?.content ?? []).map((s) => s.zIndex ?? 0));
      return addEupmyeondongMapSticker(sigunguCd, {
        stickerId: vars.stickerId,
        posX: vars.x,
        posY: vars.y,
        scale: vars.size / DEFAULT_STICKER_SIZE,
        zIndex: topZ + 1,
      });
    },
    onSuccess: () => {
      if (sigunguCd) queryClient.invalidateQueries({ queryKey: mapKeys.stickers(sigunguCd) });
    },
  });
}

/**
 * 기록을 지도 위 사진 카드로 배치.
 * 대상 시군구를 훅이 아니라 **호출 인자로** 받는다 — 기록 화면에서 넘어온 건은 지도로 들어가는
 * 것과 카드를 놓는 것이 같은 틱에 일어나서, 훅이 잡아둔 activeSigungu 는 아직 null 이기 때문이다.
 */
export function usePlacePhotoCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: {
      sigunguCd: SigunguCode;
      travelPostId: number;
      x: number;
      y: number;
      width: number;
    }) => {
      const cached = queryClient.getQueryData<ListResult<MapTravelPostResponse>>(
        mapKeys.photoCards(vars.sigunguCd),
      );
      const topZ = Math.max(0, ...(cached?.content ?? []).map((c) => c.zIndex ?? 0));
      return addEupmyeondongMapTravelPost(vars.sigunguCd, {
        travelPostId: vars.travelPostId,
        posX: vars.x,
        posY: vars.y,
        scale: vars.width / DEFAULT_PHOTO_CARD_WIDTH,
        zIndex: topZ + 1,
      });
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: mapKeys.photoCards(variables.sigunguCd) }),
  });
}

// ─── 저장되지 않는 편집(이동·크기·삭제) ────────────────────────────────────
//
// ⚠️ 서버에 스티커/사진 카드의 수정·삭제 API가 없다 — 있는 건 조회(GET)와 배치(POST)뿐이다.
// 그래서 배치 뒤의 이동·크기조절·삭제는 쿼리 캐시에만 반영한다. 화면에서는 정상 동작하지만
// 다시 받아오면(무효화/재조회) 서버 값으로 돌아간다.
// PATCH/DELETE 가 생기면 아래 setQueryData 를 mutation 으로 바꾸면 된다.

/** 캐시의 배치 목록을 그 자리에서 고친다. 목록이 아직 없으면 아무 것도 하지 않는다. */
function usePlacementEdits<T extends { mapStickerId: number }>(
  queryKey: readonly unknown[],
  enabled: boolean,
) {
  const queryClient = useQueryClient();

  const update = (id: string, patch: (item: T) => T) => {
    if (!enabled) return;
    queryClient.setQueryData<ListResult<T>>(queryKey, (old) =>
      old
        ? {
            content: old.content.map((item) =>
              String(item.mapStickerId) === id ? patch(item) : item,
            ),
          }
        : old,
    );
  };

  const remove = (id: string) => {
    if (!enabled) return;
    queryClient.setQueryData<ListResult<T>>(queryKey, (old) =>
      old ? { content: old.content.filter((item) => String(item.mapStickerId) !== id) } : old,
    );
  };

  return { update, remove };
}

/** 스티커 이동/크기조절/삭제 (세션 내 로컬 반영). */
export function useStickerEdits(sigunguCd: SigunguCode | null) {
  const { update, remove } = usePlacementEdits<MapStickerResponse>(
    mapKeys.stickers(sigunguCd ?? ""),
    sigunguCd !== null,
  );

  return {
    move: (id: string, x: number, y: number) =>
      update(id, (item) => ({ ...item, posX: x, posY: y })),
    resize: (id: string, size: number) =>
      update(id, (item) => ({ ...item, scale: clampStickerSize(size) / DEFAULT_STICKER_SIZE })),
    remove,
  };
}

/** 사진 카드 이동/크기조절/삭제 (세션 내 로컬 반영). */
export function usePhotoCardEdits(sigunguCd: SigunguCode | null) {
  const { update, remove } = usePlacementEdits<MapTravelPostResponse>(
    mapKeys.photoCards(sigunguCd ?? ""),
    sigunguCd !== null,
  );

  return {
    move: (id: string, x: number, y: number) =>
      update(id, (item) => ({ ...item, posX: x, posY: y })),
    resize: (id: string, width: number) =>
      update(id, (item) => ({
        ...item,
        scale: clampPhotoCardWidth(width) / DEFAULT_PHOTO_CARD_WIDTH,
      })),
    remove,
  };
}
