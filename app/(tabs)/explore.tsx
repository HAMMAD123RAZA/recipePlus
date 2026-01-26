import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { text, bgColor } from '@/constants/theme';
import tw from 'twrnc';
import Ui from '../components/cards/Ui.jsx';

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const catSnap = await getDocs(collection(db, 'category'));
      const catData = catSnap.docs.map(doc => doc.data().name || doc.data().title);
      setCategories(['All', ...catData]);

      // Fetch featured recipes
      const recipeSnap = await getDocs(query(collection(db, 'mealsList'), limit(10)));
      const recipeData = recipeSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecipes(recipeData);
      
    } catch (error) {
      console.error("Error fetching explore data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.length > 2) {
      setSearching(true);
      try {
        // Simple search implementation (Firestore doesn't support full-text search well)
        // In a real app, you'd use Algolia or similar, or filter client-side for small datasets
        const q = query(collection(db, 'mealsList'));
        const snap = await getDocs(q);
        const filtered = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(recipe => 
            recipe.title?.toLowerCase().includes(text.toLowerCase()) || 
            recipe.category?.toLowerCase().includes(text.toLowerCase())
          );
        setRecipes(filtered);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setSearching(false);
      }
    } else if (text.length === 0) {
      fetchInitialData();
    }
  };

  const filterByCategory = async (category) => {
    setSelectedCategory(category);
    setLoading(true);
    try {
      let q;
      if (category === 'All') {
        q = query(collection(db, 'mealsList'), limit(20));
      } else {
        q = query(collection(db, 'mealsList'), where('category', '==', category));
      }
      const snap = await getDocs(q);
      setRecipes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Filter error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[tw`flex-1 pt-12`, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={tw`px-6 mb-6`}>
        <Text style={[tw`text-3xl font-bold`, { color: text }]}>Explore</Text>
        <Text style={[tw`text-base opacity-70`, { color: text }]}>Find your next favorite meal</Text>
      </View>

      {/* Search Bar */}
      <View style={tw`px-6 mb-6`}>
        <View style={[tw`flex-row items-center px-4 py-3 rounded-2xl`, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
          <Ionicons name="search" size={20} color={text} style={tw`mr-3`} />
          <TextInput
            placeholder="Search recipes, ingredients..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={[tw`flex-1 text-base`, { color: text }]}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searching && <ActivityIndicator size="small" color={text} />}
        </View>
      </View>

      {/* Categories Horizontal List */}
      <View style={tw`mb-6`}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`px-6`}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => filterByCategory(item)}
              style={[
                tw`px-5 py-2.5 rounded-full mr-3`,
                selectedCategory === item 
                  ? { backgroundColor: text } 
                  : { backgroundColor: 'rgba(255,255,255,0.1)' }
              ]}
            >
              <Text style={[
                tw`font-semibold`,
                { color: selectedCategory === item ? bgColor : text }
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Results Grid */}
      {loading ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color={text} />
        </View>
      ) : (
        <FlatList
          data={recipes}
          numColumns={1}
          keyExtractor={(item) => item.id}
          contentContainerStyle={tw`px-6 pb-10 items-center`}
          ItemSeparatorComponent={() => <View style={tw`h-6`} />}
          ListEmptyComponent={() => (
            <View style={tw`mt-20 items-center`}>
              <Ionicons name="search-outline" size={64} color={text} style={tw`opacity-20`} />
              <Text style={[tw`mt-4 text-lg opacity-50`, { color: text }]}>No recipes found.</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <Ui
              id={item.id}
              img={item.img}
              title={item.title}
              category={item.category}
              description={item.description}
            />
          )}
        />
      )}
    </View>
  );
};

export default Explore;
