import { text } from '@/constants/theme';
import { useLocalSearchParams } from 'expo-router';
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import tw from 'twrnc';
import Ui from '../components/cards/Ui.jsx';
import { db } from "../utils/firebase";

export default function CatId() {
  const { CatId } = useLocalSearchParams();
  const decodedCat = decodeURIComponent(CatId);

  const [elements, setElements] = useState([]);

  const getData = async () => {
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
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <View style={tw`p-4`}>

      <Text style={[tw`font-bold text-3xl mb-3`, { color: text }]}>
        Categorized Recipes
      </Text>

<FlatList
  data={elements}
  showsVerticalScrollIndicator={false}
  keyExtractor={(item) => item.id}
  contentContainerStyle={{
    alignItems: 'center',
    paddingVertical: 20,
  }}
  ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
  renderItem={({ item }) => (
    <Ui
      img={item.img}
      title={item.title}
      category={item.category}
      description={item.description}
    />
  )}
/>
    </View>
  );
}
