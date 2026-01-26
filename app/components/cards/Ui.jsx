import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { text, bgColor } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function Ui({ img, description, category, title ,id}) {
  const router=useRouter()
  return (
    <TouchableOpacity
    onPress={()=>router.push('/detailPost/'+id)} 
      style={[
        tw`w-64 h-48 mr-4 rounded-xl overflow-hidden`,
        { backgroundColor: text },
      ]}
    >
      <Image
        source={img}
        style={tw`w-full h-24`}
        contentFit="cover"
      />

      <View style={tw`p-2 gap-1 flex-1`}>
        <View
          style={[
            tw`self-start px-2 py-0.5 rounded-full`,
            { backgroundColor: bgColor },
          ]}git 
        >
          <Text style={{ color: text, fontSize: 14, fontWeight: '500' }}>
            {category}
          </Text>
        </View>

        <Text
          numberOfLines={1}
          style={{ color: bgColor, fontSize: 22, fontWeight: '700' }}
        >
          {title}
        </Text>

        <Text
          numberOfLines={2}
          style={{ 
            color: bgColor, 
            fontSize: 11, 
            opacity: 0.9,
            lineHeight: 14,
          }}
        >
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}