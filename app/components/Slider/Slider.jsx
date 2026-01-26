import { View, Text, FlatList, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import tw from 'twrnc';

const { width } = Dimensions.get('window');

const SLIDER_DATA = [
  {
    id: '1',
    title: 'Discover Delicious Meals',
    description:
      'Explore a wide variety of meals from different cuisines, all in one place.',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
  },
  {
    id: '2',
    title: 'Save What You Love',
    description:
      'Bookmark your favorite meals and access them anytime, anywhere.',
    image:
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352',
  },
  {
    id: '3',
    title: 'Cook Smarter Every Day',
    description:
      'Make meal planning simple and enjoy stress-free cooking.',
    image:
      'https://images.unsplash.com/photo-1543353071-873f17a7a088',
  },
];

export default function AppSlider() {
  const flatListRef = useRef(null);
  const [index, setIndex] = useState(0);

  // auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      const next = (index + 1) % SLIDER_DATA.length;
      setIndex(next);
      flatListRef.current?.scrollToIndex({
        index: next,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [index]);

  const renderItem = ({ item }) => (
    <View
      style={[
        tw`mx-2 rounded-3xl overflow-hidden`,
        { width: width * 0.85 },
      ]}
    >
      {/* Background Image */}
      <Image
        source={{ uri: item.image }}
        style={tw`w-full h-24`}
        contentFit="cover"
      />

      {/* Overlay Card */}
      <View
        style={[
          tw`p-4`,
          { backgroundColor: '#F0F0DB' },
        ]}
      >
        <Text
          style={{
            color: '#CC561E',
            fontSize: 20,
            fontWeight: '800',
            marginBottom: 6,
          }}
        >
          {item.title}
        </Text>

        <Text
          style={{
            color: '#CC561E',
            fontSize: 14,
            lineHeight: 20,
            opacity: 0.9,
          }}
        >
          {item.description}
        </Text>
      </View>
    </View>
  );

  return (
    <FlatList
      ref={flatListRef}
      data={SLIDER_DATA}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ paddingHorizontal: 16 }}
    />
  );
}
