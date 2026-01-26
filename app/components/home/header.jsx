import { text, bgColor } from '@/constants/theme';
import { Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../utils/AuthContext';
import tw from 'twrnc';

export default function Header() {
  const { user, loginAnonymously, logout } = useAuth();

  return (
    <View style={tw`mt-4 mb-2 p-4 flex-row justify-between items-center`}>
      <View>
        <Text style={tw`text-[${text}] font-bold text-4xl`}>
          Recipe Plus
        </Text>
        <Text style={tw`text-[${text}] font-bold text-lg opacity-80`}>
          Discover Cook Save
        </Text>
      </View>
      
      <TouchableOpacity 
        onPress={user ? logout : loginAnonymously}
        style={[tw`p-3 rounded-2xl`, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
      >
        <Ionicons 
          name={user ? "log-out-outline" : "person-outline"} 
          size={24} 
          color={text} 
        />
        {user && (
          <View style={[tw`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[${bgColor}]`, { backgroundColor: '#4ADE80' }]} />
        )}
      </TouchableOpacity>
    </View>
  );
}
