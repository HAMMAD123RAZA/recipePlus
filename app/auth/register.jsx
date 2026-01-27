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

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password should be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      router.replace('/');
    } catch (error) {
      console.error(error);
      Alert.alert("Registration Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[tw`flex-1`, { backgroundColor: bgColor }]}
    >
      <ScrollView contentContainerStyle={tw`flex-grow justify-center px-8 py-10`}>
        <View style={tw`items-center mb-10`}>
          <View style={[tw`p-4 rounded-3xl mb-4`, { backgroundColor: text }]}>
            <Ionicons name="person-add" size={50} color={bgColor} />
          </View>
          <Text style={[tw`text-4xl font-bold`, { color: text }]}>Create Account</Text>
          <Text style={[tw`text-lg opacity-70`, { color: text }]}>Join our cooking community</Text>
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

        <View style={tw`mb-6`}>
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

        <View style={tw`mb-10`}>
          <Text style={[tw`mb-2 font-semibold`, { color: text }]}>Confirm Password</Text>
          <View style={[tw`flex-row items-center px-4 py-3 rounded-2xl`, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Ionicons name="lock-closed-outline" size={20} color={text} style={tw`mr-3`} />
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={[tw`flex-1 text-base`, { color: text }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleRegister}
          disabled={loading}
          style={[tw`py-4 rounded-2xl items-center mb-6`, { backgroundColor: text }]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={bgColor} />
          ) : (
            <Text style={[tw`text-lg font-bold`, { color: bgColor }]}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View style={tw`flex-row justify-center`}>
          <Text style={[tw`opacity-70`, { color: text }]}>Already have an account? </Text>
          <Link href="/auth/login" asChild>
            <TouchableOpacity>
              <Text style={[tw`font-bold`, { color: text }]}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Register;
