import { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { register } from '@/redux/auth/actions';
import { selectAuth } from '@/redux/auth/selectors';
import { Form, Button, Result } from 'antd';
import RegisterForm from '@/forms/RegisterForm';
import useLanguage from '@/locale/useLanguage';
import Loading from '@/components/Loading';
import AuthModule from '@/modules/AuthModule';

const RegisterPage = () => {
  const translate = useLanguage();
  const { isLoading, isSuccess } = useSelector(selectAuth);
  const navigate = useNavigate();
  // const size = useSize();

  const dispatch = useDispatch();
  const onFinish = (values) => {
    dispatch(register({ registerData: values }));
  };

  const FormContainer = () => {
    return (
      <Loading isLoading={isLoading}>
        <h2> Registro desactivado, por favor 
          <a href='/login'> inicia sesión.</a>
        </h2>
      </Loading>
    );
  };

  if (!isSuccess) {
    return <AuthModule authContent={<FormContainer />} AUTH_TITLE="Sign up" />;
  } else {
    return (
      <Result
        status="info"
        title={translate('Verifica tu cuenta')}
        subTitle="Registrado con éxito, revisa tu correo para verificar tu cuenta."
        // extra={
        //   <Button
        //     type="primary"
        //     onClick={() => {
        //       navigate(`/login`);
        //     }}
        //   >
        //     {translate('Login')}
        //   </Button>
        // }
      ></Result>
    );
  }
};

export default RegisterPage;
