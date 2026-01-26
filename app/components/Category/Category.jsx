import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import tw from 'twrnc';
import { bgColor, text } from '@/constants/theme';
import { fetchCat } from '@/app/utils/operations';
import { useRouter } from 'expo-router';

const Category = () => {
  const [cat, setCat] = useState([]);
const router=useRouter()
  const fetchData = async () => {
    const data = await fetchCat();
    setCat(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
onPress={() =>
  router.push(`/category/${encodeURIComponent(item.name)}`)
}
    style={[
        tw`px-5 py-4 rounded-full mr-3`,
        { backgroundColor: text },
      ]}
    >
      <Text style={{ color: bgColor, fontSize: 16, fontWeight: 'bold' }}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={tw`px-4`}>
      <Text style={[tw`font-bold text-3xl my-4`, { color: text }]}>
        Categories
      </Text>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={cat}
        renderItem={renderItem}
        keyExtractor={(item) => item.id || item._id}
      />
    </View>
  );
};

export default Category;
