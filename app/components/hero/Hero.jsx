import { text } from '@/constants/theme';
import { Text, View, FlatList } from 'react-native';
import tw from 'twrnc';
import Ui from '../cards/Ui';
import { fetchMeals } from '../../utils/operations';
import { useEffect, useState } from 'react';

export default function Hero() {
  const [meals, setMeals] = useState([]);

  const getMeals = async () => {
    const data = await fetchMeals();
    setMeals(data);
  };

  useEffect(() => {
    getMeals();
  }, []);

  const renderItem=({item})=>{
    return (
      <>
      <Ui
      id={item.id}
      img={item.img}
      title={item.title}
  category={item.category}
            description={item.description}
            onPress={() => console.log(item.title)}
      />
      </>
    )
  }

  return (
    <View style={tw`p-4`}>
      <Text style={[tw`font-bold text-3xl mb-3`, { color: text }]}>
        Featured Recipes
      </Text>

     <FlatList
     data={meals}
     horizontal
     showsHorizontalScrollIndicator={false}
    keyExtractor={(item)=>item.id}
    contentContainerStyle={{paddingRight: 16}}
    renderItem={renderItem}

     />
    </View>
  );
}
