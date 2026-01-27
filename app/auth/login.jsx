import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from 'react-native';
import { useAuth } from '../utils/AuthContext';
import { useRouter, Link } from 'expo-router';
import { text, bgColor } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { Image } from 'expo-image';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
const { login, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/');
    } catch (error) {
      console.error(error);
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[tw`flex-1`, { backgroundColor: bgColor }]}
    >
      <ScrollView contentContainerStyle={tw`flex-grow justify-center px-8`}>
        <View style={tw`items-center mb-10`}>
          <View style={[tw`p-4 rounded-3xl mb-4`, { backgroundColor: text }]}>
            <Ionicons name="restaurant" size={50} color={bgColor} />
          </View>
          <Text style={[tw`text-4xl font-bold`, { color: text }]}>Welcome Back</Text>
          <Text style={[tw`text-lg opacity-70`, { color: text }]}>Sign in to continue</Text>
        </View>

        <View style={tw`mb-6`}>
          <Text style={[tw`mb-2 font-semibold`, { color: text }]}>Email Address</Text>
          <View style={[tw`flex-row items-center px-4 py-3 rounded-2xl`, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Ionicons name="mail-outline" size={20} color={text} style={tw`mr-3`} />
            <TextInput
              placeholder="example@mail.com"
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={[tw`flex-1 text-base`, { color: text }]}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        <View style={tw`mb-10`}>
          <Text style={[tw`mb-2 font-semibold`, { color: text }]}>Password</Text>
          <View style={[tw`flex-row items-center px-4 py-3 rounded-2xl`, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Ionicons name="lock-closed-outline" size={20} color={text} style={tw`mr-3`} />
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={[tw`flex-1 text-base`, { color: text }]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleLogin}
          disabled={loading}
          style={[tw`py-4 rounded-2xl items-center mb-6`, { backgroundColor: text }]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={bgColor} />
          ) : (
            <Text style={[tw`text-lg font-bold`, { color: bgColor }]}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={tw`flex-row justify-center`}>
          <Text style={[tw`opacity-70`, { color: text }]}>Don't have an account? </Text>
          <Link href="/auth/register" asChild>
            <TouchableOpacity>
              <Text style={[tw`font-bold`, { color: text }]}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
              <TouchableOpacity
  onPress={loginWithGoogle}
  style={[
    tw`px-8 py-4 rounded-full flex-row items-center justify-center gap-3 mt-6`,
    { backgroundColor: text }
  ]}
>
  <Image
    source={{ uri: 'https://1000logos.net/wp-content/uploads/2016/11/New-Google-Logo.jpg' }}
    style={{ width: 24, height: 24 }}
  />
  <Text style={{ color: bgColor, fontWeight: 'bold' }}>
    Continue with Google
  </Text>
</TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
