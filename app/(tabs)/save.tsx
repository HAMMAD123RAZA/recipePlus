import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from '../utils/AuthContext';
import { text, bgColor } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import Ui from '../components/cards/Ui.jsx';

const Save = () => {
  const { user, loginAnonymously } = useAuth();
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'save'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recipes = snapshot.docs.map(doc => ({
        saveId: doc.id,
        id: doc.data().recipeId,
        title: doc.data().recipeTitle,
        img: doc.data().recipeImg,
        category: doc.data().recipeCategory,
      }));
      setSavedRecipes(recipes);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching saved recipes:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const removeSaved = async (saveId) => {
    try {
      await deleteDoc(doc(db, 'save', saveId));
    } catch (error) {
      console.error("Error removing recipe:", error);
      Alert.alert("Error", "Could not remove recipe.");
    }
  };

  if (!user) {
    return (
      <View style={[tw`flex-1 justify-center items-center px-10`, { backgroundColor: bgColor }]}>
        <Ionicons name="lock-closed-outline" size={80} color={text} style={tw`opacity-20 mb-6`} />
        <Text style={[tw`text-2xl font-bold text-center mb-2`, { color: text }]}>Sign in to Save</Text>
        <Text style={[tw`text-base text-center opacity-70 mb-8`, { color: text }]}>
          Create an account to keep track of your favorite recipes across devices.
        </Text>
        <TouchableOpacity 
          onPress={loginAnonymously}
          style={[tw`px-8 py-4 rounded-2xl`, { backgroundColor: text }]}
        >
          <Text style={[tw`text-lg font-bold`, { color: bgColor }]}>Get Started</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[tw`flex-1 pt-12`, { backgroundColor: bgColor }]}>
      <View style={tw`px-6 mb-6 flex-row justify-between items-end`}>
        <View>
          <Text style={[tw`text-3xl font-bold`, { color: text }]}>My Collection</Text>
          <Text style={[tw`text-base opacity-70`, { color: text }]}>
            {savedRecipes.length} {savedRecipes.length === 1 ? 'recipe' : 'recipes'} saved
          </Text>
        </View>
        <Ionicons name="bookmark" size={32} color={text} />
      </View>

      {loading ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color={text} />
        </View>
      ) : (
        <FlatList
          data={savedRecipes}
          keyExtractor={(item) => item.saveId}
          contentContainerStyle={tw`px-6 pb-10 items-center`}
          ItemSeparatorComponent={() => <View style={tw`h-6`} />}
          ListEmptyComponent={() => (
            <View style={tw`mt-20 items-center`}>
              <Ionicons name="heart-outline" size={64} color={text} style={tw`opacity-20`} />
              <Text style={[tw`mt-4 text-lg opacity-50 text-center`, { color: text }]}>
                Your collection is empty.{"\n"}Start exploring and save some recipes!
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={tw`relative`}>
              <Ui
                id={item.id}
                img={item.img}
                title={item.title}
                category={item.category}
                description=""
              />
              <TouchableOpacity 
                onPress={() => removeSaved(item.saveId)}
                style={[tw`absolute top-2 right-6 p-2 rounded-full`, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
              >
                <Ionicons name="trash-outline" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default Save;
