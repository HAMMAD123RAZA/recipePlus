import { text } from '@/constants/theme';
import { Text, View } from 'react-native';
import tw from 'twrnc';
export default function Header() {
  return (
    <View style={tw` mt-4 mb-2 p-4`}>
      <Text style={tw` text-[${text}] font-bold text-5xl`}>
Recipe Plus
      </Text>
         <Text style={tw` text-[${text}]  font-bold text-lg`}>
Discover Cook Save
      </Text>
    </View>
  );
}
