import React, {useEffect, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Login from './login';
import Profile from './profile';
import Registration from './registration';
import ForgetPassword from './forget-password';
import ResetPassword from './reset-password';
import EditProfile from './edit-profile';
import OrderHistory from './order-history';
import OrderHistoryDetail from './order-history-detail';
import {useSelector} from 'react-redux';
import RatingAndReview from './rating-and-review';
import ForgetPasswordSelectOption from './forget-password-select-option';
import ForgetPasswordOtp from './forget-password-otp';
import ForgetPasswordConfirm from './forget-password-confirm-password';

const ProfileStack = createStackNavigator();

export default function ProfileTab() {
  const profile = useSelector((state) => state.profile);

  return (
    <ProfileStack.Navigator>


      {profile.isUserLoggedIn == false ? (
        <ProfileStack.Screen
          name="Login"
          options={{title: 'Login'}}
          component={Login}
        />
      ) : (
        <ProfileStack.Screen
          name="Profile"
          options={{title: 'Your Profile'}}
          component={Profile}
        />
      )}

      <ProfileStack.Screen
        name="Registration"
        options={{title: 'SIGN UP'}}
        component={Registration}
      />
      <ProfileStack.Screen
        name="ForgetPassword"
        options={{title: 'Forget Password'}}
        component={ForgetPassword}
      />
      <ProfileStack.Screen
        name="ResetPassword"
        options={{title: 'Reset Password'}}
        component={ResetPassword}
      />

      <ProfileStack.Screen
        name="EditProfile"
        options={{title: 'Edit Your Information '}}
        component={EditProfile}
      />
      <ProfileStack.Screen
        name="OrderHistory"
        options={{title: 'Your Orders'}}
        component={OrderHistory}
      />
      <ProfileStack.Screen
        name="OrderHistoryDetail"
        options={{title: 'Order Detail'}}
        component={OrderHistoryDetail}
      />
      <ProfileStack.Screen
        name="RatingAndReview"
        options={{title: 'Review & Rating'}}
        component={RatingAndReview}
      />
      <ProfileStack.Screen
        name="ForgetPasswordSelectOption"
        options={{title: 'Forget Password'}}
        component={ForgetPasswordSelectOption}
      />
      <ProfileStack.Screen
        name="ForgetPasswordOtp"
        options={{title: 'Verification Code'}}
        component={ForgetPasswordOtp}
      />
      <ProfileStack.Screen
        name="ForgetPasswordConfirm"
        options={{title: 'Confirm New Password'}}
        component={ForgetPasswordConfirm}
      />
    </ProfileStack.Navigator>
  );
}
