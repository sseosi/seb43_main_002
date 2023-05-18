import Header from './Header';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Error } from '../style/SignupStyle';
import {
  Mobile,
  BackGround,
  BackYellow,
  EditForm,
  EditIcon,
  ProfileImg,
} from '../style/EditProfileStyle';
import axios from 'axios';

const EditProfile = () => {
  const { register, handleSubmit, reset } = useForm();
  const navigate = useNavigate();

  const [data, setData] = useState();
  const [name, setName] = useState();
  const [nickname, setNickname] = useState();
  const [intro, setIntro] = useState();
  const [birthDay, setBirthDay] = useState();
  const [gender, setGender] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordError, setPasswordError] = useState('');
  const [introLengthError, setIntroLengthError] = useState('');
  const [nameError, setNameError] = useState('');
  const [nicknameError, setNicknameError] = useState('');

  const [profileImage, setProfileImage] = useState();
  const profileImgFileInput = useRef(null);

  useEffect(() => {
    axios
      .get('http://localhost:3001/members/1')
      .then((response) => {
        setData(response.data);
        setGender(response.data.gender);
        setProfileImage(response.data.img);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const profileChange = (e) => {
    if (e.target.files.length > 0) {
      const formData = new FormData();
      for (let i = 0; i < e.target.files.length; i++) {
        // formData 객체가 따로 있다. 키 / 값 형태로 서버에 들어간다고 함.
        formData.append('files', e.target.files[i], e.target.files[i].name);
      }

      axios
        .post('/members/images/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          setProfileImage(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const onSubmit = () => {
    console.log('우선 성공 하는지');

    // 일단 post 요청 보냄(원래라면 put이나 patch사용)
    axios
      .post('http://localhost:3001/members', {
        name,
        nickname,
        intro,
        birthDay,
        gender,
        email,
        password,
        confirmPassword,
        img: profileImage,
      })
      .then((response) => {
        reset();
        navigate('/mypage');
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleCheckDuplicateNickname = () => {
    axios
      .post('members/signup/checkduplicatenickname', {
        nickname,
      })
      .then((response) => {
        if (response.data === false) {
          alert('사용 가능한 활동명입니다.');
        } else {
          setNicknameError('이미 활동중인 식구이름입니다.');
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const passwordRegex = /^(?=.[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  const validationPassword = (password) => {
    return passwordRegex.test(password);
  };

  const handlePassword = () => {
    console.log(password.length);
    if (
      !validationPassword(password) ||
      password.length < 8 ||
      !validationPassword(confirmPassword) ||
      confirmPassword.length < 8
    ) {
      setPasswordError('비밀번호는 영문자,숫자를 포함한 8자 이상이어야합니다.');
    } else if (password !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
    } else {
      setPasswordError(null);
    }
  };

  const handleNickname = (e) => {
    setNickname(e.target.value);
    if (e.target.value.length > 8) {
      setNicknameError('8글자까지 입력 가능합니다.');
    } else if (e.target.value.length === 0) {
      setNicknameError('활동명은 필수 입력입니다.');
    } else {
      setNicknameError(null);
    }
  };

  const handleIntro = (e) => {
    setIntro(e.target.value);
    if (e.target.value.length > 20) {
      setIntroLengthError('20글자까지 입력 가능합니다.');
    } else {
      setIntroLengthError(null);
    }
  };

  const handleName = (e) => {
    setName(e.target.value);
    if (e.target.value.length > 8) {
      setNameError('8글자까지 입력 가능합니다.');
    } else if (e.target.value.length === 0) {
      setNameError('이름 필수 입력입니다.');
    } else {
      setNameError(null);
    }
  };

  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const position = document.getElementById('mobileContainer').scrollTop;
      setScrollPosition(position);
      console.log(position);
    };

    const mobileContainer = document.getElementById('mobileContainer');
    if (mobileContainer) {
      mobileContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (mobileContainer) {
        mobileContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [data]);

  const nameIcon = '/svg/join-name.svg';
  const introIcon = '/svg/join-intro.svg';
  const dateIcon = '/svg/join-date.svg';
  const genderIcon = '/svg/join-gender.svg';
  const mailIcon = '/svg/join-mail.svg';
  const pwdIcon = '/svg/join-password.svg';

  return (
    <>
      {data && (
        <Mobile id="mobileContainer">
          <BackGround>
            <BackYellow />
          </BackGround>
          <Header
            iconSrc="/svg/header-back.svg"
            fnc="back"
            scrollPosition={scrollPosition}
          />
          <ProfileImg>
            <div>
              <div>
                <img src={profileImage} alt="프로필 사진" />
                <div></div>
              </div>
              <label htmlFor="file">
                <div></div>
              </label>
              <input
                type="file"
                id="file"
                accept="image/*"
                onChange={profileChange}
                ref={profileImgFileInput}
              />
            </div>
          </ProfileImg>
          <EditForm onSubmit={handleSubmit(onSubmit)}>
            <div className="form-email">
              <label htmlFor="email">
                <EditIcon backgroundImage={mailIcon} />
                이메일
              </label>
              <input
                id="email"
                defaultValue={data.email}
                {...register('email', {
                  required: true,
                  pattern: {
                    value: '^[w-]+(.[w-]+)*@([w-]+.)+[a-zA-Z]{2,7}$',
                    message: '이메일 유효성 검사, 관련 내용 받아야 함.',
                  },
                })}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                readOnly
              />
            </div>
            <div className="form-nickname">
              <label htmlFor="nickname">
                <EditIcon backgroundImage={nameIcon} />
                활동명
              </label>
              <input
                id="nickname"
                defaultValue={data.nickname}
                onChange={handleNickname}
              />
              <button type="button" onClick={handleCheckDuplicateNickname}>
                활동명 중복확인
              </button>
              {nicknameError && <Error>{nicknameError}</Error>}
            </div>
            <div className="form-intro">
              <label htmlFor="intro">
                <EditIcon backgroundImage={introIcon} />
                자기소개
              </label>
              <input
                id="intro"
                defaultValue={data.intro}
                onChange={handleIntro}
              />
              {introLengthError && <Error>{introLengthError}</Error>}
            </div>
            <div className="form-gender">
              <label htmlFor="gender">
                <EditIcon backgroundImage={genderIcon} />
                성별
              </label>
              <div>
                <button
                  type="button"
                  className={gender ? '' : 'active'}
                  onClick={() => {
                    setGender(false);
                  }}
                >
                  여성
                </button>
                <button
                  type="button"
                  className={gender ? 'active' : ''}
                  onClick={() => {
                    setGender(true);
                  }}
                >
                  남성
                </button>
              </div>
            </div>
            <div className="form-name">
              <label htmlFor="name">
                <EditIcon backgroundImage={nameIcon} />
                이름
              </label>
              <input id="name" defaultValue={data.name} onChange={handleName} />
              {nameError && <Error>{nameError}</Error>}
            </div>
            <div className="form-pwd">
              <label htmlFor="pwd">
                <EditIcon backgroundImage={pwdIcon} />
                비밀번호
              </label>
              <input
                id="pwd"
                type="password"
                placeholder="숫자, 영문자 포함 8글자 이상이어야 합니다."
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
            </div>
            <div className="form-pwd-check">
              <label htmlFor="pwd-check">
                <EditIcon backgroundImage={pwdIcon} />
                비밀번호 확인
              </label>
              <input
                id="pwd-check"
                type="password"
                placeholder="비밀번호를 한 번 더 입력해주세요."
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                }}
              />
              <button type="button" onClick={handlePassword}>
                비밀번호 일치 여부 확인
              </button>
              {passwordError && <Error>{passwordError}</Error>}
            </div>
            <div className="form-birth">
              <label htmlFor="birth">
                <EditIcon backgroundImage={dateIcon} />
                생년월일
              </label>
              <input
                id="birth"
                type="date"
                defaultValue={data.birth}
                onChange={(e) => {
                  setBirthDay(e.target.value);
                }}
              />
            </div>
            <button type="submit">수정 완료</button>
          </EditForm>
        </Mobile>
      )}
    </>
  );
};

export default EditProfile;
