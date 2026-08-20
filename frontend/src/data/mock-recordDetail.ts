export interface RecordDetailContent {
  type: "image" | "text";
  src?: string;
  text?: string;
}

export interface RecordDetail {
  travelPostId: number;
  emdNm: string;
  logDate: string;
  contents: RecordDetailContent[];
}

export const MOCK_RECORD_DETAIL: RecordDetail = {
  travelPostId: 1,
  emdNm: "안목동",
  logDate: "2026.06.15",
  contents: [
    {
      type: "image",
      src: "/record/image1.png",
    },
    {
      type: "text",
      text: `Lorem ipsum dolor sit amet consectetur.
Massa massa elementum aliquam quis mattis.
Pretium at venenatis ultrices nunc lacus viverra eros.
Euismod felis nisi eleifend consectetur nisl.
Scelerisque tincidunt suspendisse a et accumsan nunc.
Morbi bibendum sed pulvinar augue.`,
    },
    {
      type: "image",
      src: "/record/image2.png",
    },
    {
      type: "text",
      text: `Lorem ipsum dolor sit amet consectetur.
Massa massa elementum aliquam quis mattis.
Pretium at venenatis ultrices nunc lacus viverra eros.
Euismod felis nisi eleifend consectetur nisl.
Scelerisque tincidunt suspendisse a et accumsan nunc.
Morbi bibendum sed pulvinar augue.`,
    },
  ],
};