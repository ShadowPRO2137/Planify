import { TextInput, View, Text, Button, Alert, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useUser } from '@/app/context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { TabsParamList } from '@/.expo/types/navigationTypes';
import { StackNavigationProp } from '@react-navigation/stack';

type AccountScreenNavigationProp = StackNavigationProp<TabsParamList, 'Account'>;

const DB_URL = 'https://66fc2a93c3a184a84d16505f.mockapi.io/Users';

interface User {
  email: string;
  password: string;
  UserName: string;
  AboutMe: string;
  Joined: number;
  IsLightMode: boolean;
  id: number;
  plan: string[];
}

const Account = () => {
  const [userEnteredUsername, setUsername] = useState<string>('');
  const [userEnteredPassword, setPassword] = useState<string>('');
  const [userEnteredConfirmPassword, setConfirmPassword] = useState<string>('');
  const [userEnteredEmail, setEmail] = useState<string>('');
  const [userEnteredAboutMe, setAboutMe] = useState<string>('');
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const [isLightMode, setIsLightMode] = useState<boolean>(false);
  const { userId, setUserId } = useUser();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigation = useNavigation<AccountScreenNavigationProp>();

  useEffect(() => {
    if (!userId) {
      clearInputFields();
    }
  }, [userId]);
  
  const goToCalendarScreen = () => {
    navigation.navigate('Calendar');
  };

  const clearInputFields = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setAboutMe('');
  };

  const handleLogin = async () => {
    try {
      const response = await axios.get(DB_URL);
      const users: User[] = response.data;

      const user = users.find(
        (u: User) => u.UserName === userEnteredUsername && u.password === userEnteredPassword
      );
  
      if (user) {
        setUserId(user.id); 
        goToCalendarScreen()
      } else {
        Alert.alert('Login Failed', 'Wrong username or password.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      Alert.alert('Error', 'Could not login, please try again later.');
    }
  };
  

  const addUser = async () => {
    if (!userEnteredEmail || !validateEmail(userEnteredEmail)) {
      Alert.alert('Invalid Email', 'Must be a valid email address.');
      return;
    }
    if (!userEnteredPassword || !validatePassword(userEnteredPassword)) {
      Alert.alert('Invalid Password', 'Must be 5-12 characters, include at least one uppercase letter, one lowercase letter, and one digit.');
      return;
    }
    if (checkIfPasswordAndConfirmPasswordAreSame(userEnteredPassword, userEnteredConfirmPassword) == false) {
      Alert.alert('Invalid Confirm Password', 'Confirm Password and Password must be same.');
      return;
    }
    if (!userEnteredUsername || userEnteredUsername.length < 2 || userEnteredUsername.length > 15) {
      Alert.alert('Invalid Username', 'Username must be between 2 and 15 characters.');
      return;
    }
    if (userEnteredAboutMe && (userEnteredAboutMe.length < 25 || userEnteredAboutMe.length > 500)) {
      Alert.alert('Invalid About Me', 'About Me must be between 25 and 500 characters.');
      return;
    }

    try {
      const response = await axios.get(DB_URL);
      const users = response.data;
      const existingUser = users.find((user: any) => user.UserName === userEnteredUsername);

      if (existingUser) {
        Alert.alert('Username Taken', 'This Username is used by another user.');
        return;
      }
      const newUser = {
        email: userEnteredEmail,
        password: userEnteredPassword,
        UserName: userEnteredUsername,
        AboutMe: userEnteredAboutMe,
        Joined: Math.floor(Date.now() / 1000),
      };

      const createResponse = await axios.post(DB_URL, newUser);
      if (createResponse.status === 201) {
        Alert.alert('User added successfully');
        clearInputFields();
        setIsLoginMode(true);
      } else {
        Alert.alert('Failed to add user');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not create user, please try again later.');
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const checkIfPasswordAndConfirmPasswordAreSame = (password: string, confirmPassword: string) => {
    if (password == confirmPassword) {
      return true;
    } else {
      return false;
    }
  };

  const validatePassword = (password: string) => {
    const re = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{5,12}$/;
    return re.test(password);
  };

  const handleLogout = () => {
    setUserId(-1);
    Alert.alert('Logout Successful', 'You have been logged out.');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isLightMode ? 'white' : '#001f3f' }]}>
      <ParallaxScrollView headerBackgroundColor={{ light: '#D0D0D0', dark: isLightMode ? '#D3D3D3' : '#353636' }} headerImage={<Ionicons size={250} name="person-circle" style={styles.headerImage}/>} additionalStyles={{ header: {}, content: { backgroundColor: isLightMode ? 'white' : '#1A1A1A' }}}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setIsLightMode(!isLightMode)}>
            <Ionicons name={isLightMode ? 'moon' : 'sunny'} size={30} color={isLightMode ? 'black' : 'white'}/>
          </TouchableOpacity>
        </View>
        <View style={styles.newAccount}>
          {isLoginMode ? (
            <View>
              <Text style={[styles.loginInText, { color: isLightMode ? 'black' : 'white' }]}>Username:</Text>
              <TextInput style={[styles.input, { backgroundColor: isLightMode ? 'white' : '#001f3f', color: isLightMode ? 'black' : 'white' }]} placeholder="Enter username..." value={userEnteredUsername} onChangeText={setUsername} placeholderTextColor={isLightMode ? 'gray' : 'lightgray'} />
              <Text style={[styles.loginInText, { color: isLightMode ? 'black' : 'white' }]}>Password:</Text>
              <TextInput style={[styles.input, { backgroundColor: isLightMode ? 'white' : '#001f3f', color: isLightMode ? 'black' : 'white' }]} placeholder="Enter password..." value={userEnteredPassword} onChangeText={setPassword} secureTextEntry={!showPassword} placeholderTextColor={isLightMode ? 'gray' : 'lightgray'} />
              <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={24} color={isLightMode ? 'black' : 'white'} />
              </TouchableOpacity>
              <View style={styles.loginOrCreateAccountButton}>
                <Button title="Login In" onPress={handleLogin} color={isLightMode ? '#0066cc' : '#0066cc'} />
              </View>
              {/*<Text>{userId}</Text> */ }
              <Text style={[styles.switchModeText, { color: isLightMode ? 'black' : 'white' }]}>Don't have an account? <Text style={styles.switchModeLink} onPress={() => setIsLoginMode(false)}>Create One Here!</Text></Text>
            </View>
          ) : (
            <View>
              <Text style={[styles.loginInText, { color: isLightMode ? 'black' : 'white' }]}>Email:</Text>
              <TextInput style={[styles.input, { backgroundColor: isLightMode ? 'white' : '#001f3f', color: isLightMode ? 'black' : 'white' }]} placeholder="Enter email..." value={userEnteredEmail} onChangeText={setEmail} placeholderTextColor={isLightMode ? 'gray' : 'lightgray'} />
              <Text style={[styles.loginInText, { color: isLightMode ? 'black' : 'white' }]}>Password:</Text>
              <TextInput style={[styles.input, { backgroundColor: isLightMode ? 'white' : '#001f3f', color: isLightMode ? 'black' : 'white' }]} placeholder="Enter password..." value={userEnteredPassword} onChangeText={setPassword} secureTextEntry={!showPassword} placeholderTextColor={isLightMode ? 'gray' : 'lightgray'} />
              <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={24} color={isLightMode ? 'black' : 'white'} />
              </TouchableOpacity>
              <Text style={[styles.loginInText, { color: isLightMode ? 'black' : 'white' }]}>Confirm Password:</Text>
              <TextInput style={[styles.input, { backgroundColor: isLightMode ? 'white' : '#001f3f', color: isLightMode ? 'black' : 'white' }]} placeholder="Enter password..." value={userEnteredConfirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} placeholderTextColor={isLightMode ? 'gray' : 'lightgray'} />
              <Text style={[styles.loginInText, { color: isLightMode ? 'black' : 'white' }]}>Username:</Text>
              <TextInput style={[styles.input, { backgroundColor: isLightMode ? 'white' : '#001f3f', color: isLightMode ? 'black' : 'white' }]} placeholder="Enter username..." value={userEnteredUsername} onChangeText={setUsername} placeholderTextColor={isLightMode ? 'gray' : 'lightgray'} />
              <Text style={[styles.loginInText, { color: isLightMode ? 'black' : 'white' }]}>About Me: (optional)</Text>
              <TextInput style={[styles.textArea, { backgroundColor: isLightMode ? 'white' : '#001f3f', color: isLightMode ? 'black' : 'white' }]} placeholder="Enter about me..." value={userEnteredAboutMe} onChangeText={setAboutMe} multiline numberOfLines={4} placeholderTextColor={isLightMode ? 'gray' : 'lightgray'} />
              <View style={styles.loginOrCreateAccountButton}>
                <Button title="Create Account" onPress={addUser} color={isLightMode ? '#0066cc' : '#0066cc'} />
              </View>
              <Text style={[styles.switchModeText, { color: isLightMode ? 'black' : 'white' }]}>Already have an account? <Text style={styles.switchModeLink} onPress={() => setIsLoginMode(true)}>Login In Here!</Text></Text>
            </View>
          )}
        </View>
        {userId !== -1 && ( 
          <View style={styles.logoutButtonContainer}>
            <Button title="Logout" onPress={handleLogout} color={isLightMode ? '#ff4d4d' : '#ff4d4d'} />
          </View>
        )}
        <Text style={styles.bigFont}> </Text>
      </ParallaxScrollView>
    </SafeAreaView>
  );
};

export default Account;

const styles = StyleSheet.create({
  bigFont: {
    fontSize: 125,
  },
  headerImage: {
    color: '#808080',
    bottom: -75,
    left: -25,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  newAccount: {
    textAlign: 'left',
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    gap: 20,
  },
  eyeIcon: {
    position: 'absolute',
    left: 285,
    top: 117,
    transform: [{ translateY: -12 }],
  },
  input: {
    height: 40,
    borderColor: 'lightblue',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    borderColor: 'lightblue',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    paddingBottom: 70,
    marginBottom: 10,
  },
  loginInText: {
    marginBottom: 5,
  },
  loginOrCreateAccountButton: {
    marginRight: 15,
  },
  switchModeText: {
    textAlign: 'center',
    marginTop: 10,
  },
  switchModeLink: {
    color: 'lightblue',
  },
  logoutButtonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});