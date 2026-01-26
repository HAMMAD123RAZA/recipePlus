import { text, bgColor } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { FlatList, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import Ui from '../components/cards/Ui.jsx';
import { db } from "../utils/firebase";

export default function CatId() {
  const { CatId } = useLocalSearchParams();
  const decodedCat = decodeURIComponent(CatId);
  const router = useRouter();

  const [elements, setElements] = useState([]);
  const [loading, setLoading] = useState(true);

  const getData = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'mealsList'),
        where('category', '==', decodedCat)
      );

      const qSnapShot = await getDocs(q);
      const data = qSnapShot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setElements(data);
    } catch (error) {
      console.error("Error fetching categorized recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [decodedCat]);

  if (loading) {
    return (
      <View style={[tw`flex-1 justify-center items-center`, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={text} />
      </View>
    );
  }

  return (
    <View style={[tw`flex-1`, { backgroundColor: bgColor }]}>
      <View style={tw`px-4 pt-4 pb-2 flex-row items-center justify-between`}>
        <View>
          <Text style={[tw`font-bold text-3xl`, { color: text }]}>
            {decodedCat}
          </Text>
          <Text style={[tw`text-sm opacity-70`, { color: text }]}>
            {elements.length} {elements.length === 1 ? 'Recipe' : 'Recipes'} found
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={[tw`p-2 rounded-full`, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
        >
          <Ionicons name="close" size={24} color={text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={elements}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw`p-4 items-center`}
        ItemSeparatorComponent={() => <View style={tw`h-6`} />}
        ListEmptyComponent={() => (
          <View style={tw`mt-20 items-center`}>
            <Ionicons name="restaurant-outline" size={64} color={text} style={tw`opacity-20`} />
            <Text style={[tw`mt-4 text-lg opacity-50`, { color: text }]}>No recipes in this category yet.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={tw`w-full items-center`}>
            <Ui
              id={item.id}
              img={item.img}
              title={item.title}
              category={item.category}
              description={item.description}
            />
          </View>
        )}
      />
    </View>
  );
}
