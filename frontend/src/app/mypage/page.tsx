'use client';

import styled from 'styled-components';
import { useRouter } from 'next/navigation';

interface MenuItem {
    icon: string;
    label: string;
    bg?: string;
    onClick: () => void;
}

const Wrapper = styled.div`
  width: 100%;
  margin: 0 auto;
  min-height: 100vh;
  background: #DCE7E6;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  background: linear-gradient(270deg, #6CA59C 0%, #496E68 99.99%, #293F3C 100%);
  padding: 0;
  position: relative;
  width: 100%;
  height: 217px;
  margin: 0;
  z-index: 1;
`;

const BackBtn = styled.button`
  position: absolute;
  top: 40px;
  left: 26px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  img {
    width: 26px;
    height: 26px;
    display: block;
  }
`;

const Profile = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 70px;  
  gap: 0;
`;

const Avatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #fff;
  overflow: hidden;   

  img {
    width: 100%;
    height: 100%;
    object-fit: cover; 
  }
`;

const Username = styled.p`
  margin-top: 14px;
  margin-bottom: 14px;
  color: #fff;
  text-align: center;
  font-family: Pretendard, sans-serif;
  font-size: 16px;
  font-weight: 400;
  font-style: normal;
  line-height: normal;
`;

const Content = styled.div`
  flex: 1;
  padding: 0 20px;
  margin-top: -40px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 2;
`;

const QuickMenu = styled.div`
  background: #fff;
  border-radius: 9px;
  display: grid;
  height: 83px;
  grid-template-columns: repeat(3, 1fr);
  padding: 17px 0;
  align-items: center;     
`;

const QuickMenuButton = styled.button`
  width: 100%;              
  background: none;
  border: none;
  display: flex;
  height: 49px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  position: relative;

    &:not(:last-child) {
        border-right: 1px solid #D9D9D9; 
    }


  img {
    width: 24px;
    height: 24px;
  }

  span {
    color: #000;
    text-align: center;
    font-family: Pretendard, sans-serif;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  } 
`;

const MenuList = styled.div`
  background: #fff;
  border-radius: 9px;
  overflow: hidden;
`;

const MenuListButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 18px 22px;
  position: relative;
  text-align: left;
  transition: background 0.2s;

    &:not(:last-child)::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 27px;        
        right: 27px;           
        height: 1px;
        background: #D9D9D9;
    }
`;

const MenuIcon = styled.span<{ bg?: string }>`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  flex-shrink: 0;
  background: ${({ bg }) => bg || 'transparent'};

  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
`;

const MenuLabel = styled.span`
  flex: 1;
  color: #000;
  font-family: Pretendard, SansSerif;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const Chevron = styled.img`
  width: 6px;
  height: 12px;
  flex-shrink: 0;
  object-fit: contain;
`;

const Footer = styled.div`
  padding: 20px 22px;
`;

const LogoutBtn = styled.button`
  width: 100%;
  height: 48px;              
  padding: 0 64px;           
  border-radius: 61px;
  background: #6CA59C;
  color: #fff;
  display: flex;             
  justify-content: center;
  align-items: center;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  transition: opacity 0.2s;

`;

export default function MyPage() {
    const router = useRouter();

    const goBack = () => router.back();
    const onEditInfo = () => console.log('정보 수정 클릭');
    const onFaq = () => console.log('FAQ 클릭');
    const onSettings = () => console.log('환경 설정 클릭');
    const onNotice = () => console.log('공지사항 클릭');
    const onEvent = () => console.log('이벤트 게시판 클릭');
    const onMission = () => console.log('진행중인 미션 클릭');
    const onContact = () => console.log('contact 클릭');
    const onLogout = () => {
        console.log('로그아웃 클릭');
    };

    const menuItems: MenuItem[] = [
        { icon: '/assets/notice.png', label: '공지사항', onClick: onNotice },
        { icon: '/assets/event.png', label: '이벤트 게시판', onClick: onEvent },
        { icon: '/assets/mission.png', label: '진행중인 미션', onClick: onMission },
        { icon: '/assets/contact.png', label: 'contact',onClick: onContact },
    ];

    return (
        <Wrapper>
            <Header>
                <BackBtn onClick={goBack} aria-label="뒤로가기">
                    <img src="/assets/back.png" />
                </BackBtn>

                <Profile>
                    <Avatar>
                        <img src="/assets/profile-default.png" alt="프로필 사진" />
                    </Avatar>
                    <Username>수빈 님</Username>
                </Profile>
            </Header>

            <Content>
                <QuickMenu>
                       <QuickMenuButton onClick={onEditInfo}>
                           <img src="/assets/edit.png"/>
                           <span>정보 수정</span>
                       </QuickMenuButton>
                       <QuickMenuButton onClick={onFaq}>
                           <img src="/assets/FAQ.png"/>
                           <span>FAQ</span>
                       </QuickMenuButton>
                       <QuickMenuButton onClick={onSettings}>
                           <img src="/assets/settings.png"/>
                           <span>환경 설정</span>
                       </QuickMenuButton>
                </QuickMenu>

                <MenuList>
                    {menuItems.map((item) => (
                        <MenuListButton key={item.label} onClick={item.onClick}>
                            <MenuIcon bg={item.bg}>
                                <img src={item.icon} alt="" />
                            </MenuIcon>
                            <MenuLabel>{item.label}</MenuLabel>
                            <Chevron src="/assets/Vector-right.png" alt="" />
                        </MenuListButton>
                    ))}
                </MenuList>
            </Content>

            <Footer>
                <LogoutBtn onClick={onLogout}>로그아웃</LogoutBtn>
            </Footer>
        </Wrapper>
    );
}