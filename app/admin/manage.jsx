import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  Alert,
  Modal,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from '../utils/AuthContext';
import { text, bgColor } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import tw from 'twrnc';

const AdminManage = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    img: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    ingredients: '',
    instructions: ''
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      Alert.alert("Access Denied", "Only super users can access this area.");
      router.replace('/');
      return;
    }
    fetchRecipes();
  }, [isAdmin, authLoading]);

  const fetchRecipes = async () => {
    try {
      const q = query(collection(db, 'mealsList'), orderBy('title'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecipes(data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.category) {
      Alert.alert("Error", "Title and Category are required.");
      return;
    }

    try {
      setLoading(true);
      const recipeData = {
        ...formData,
        ingredients: typeof formData.ingredients === 'string' ? formData.ingredients.split(',').map(i => i.trim()) : formData.ingredients,
        instructions: typeof formData.instructions === 'string' ? formData.instructions.split('\n').map(i => i.trim()) : formData.instructions,
      };

      if (editingRecipe) {
        await updateDoc(doc(db, 'mealsList', editingRecipe.id), recipeData);
        Alert.alert("Success", "Recipe updated successfully!");
      } else {
        await addDoc(collection(db, 'mealsList'), recipeData);
        Alert.alert("Success", "Recipe added successfully!");
      }
      
      setModalVisible(false);
      setEditingRecipe(null);
      resetForm();
      fetchRecipes();
    } catch (error) {
      console.error("Error saving recipe:", error);
      Alert.alert("Error", "Failed to save recipe.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Recipe",
      "Are you sure you want to delete this recipe?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'mealsList', id));
              fetchRecipes();
            } catch (error) {
              console.error("Error deleting recipe:", error);
            }
          }
        }
      ]
    );
  };

  const openEdit = (recipe) => {
    setEditingRecipe(recipe);
    setFormData({
      title: recipe.title || '',
      category: recipe.category || '',
      description: recipe.description || '',
      img: recipe.img || '',
      prepTime: recipe.prepTime || '',
      cookTime: recipe.cookTime || '',
      servings: recipe.servings || '',
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.join(', ') : recipe.ingredients || '',
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions.join('\n') : recipe.instructions || ''
    });
    setModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      description: '',
      img: '',
      prepTime: '',
      cookTime: '',
      servings: '',
      ingredients: '',
      instructions: ''
    });
  };

  if (authLoading || !isAdmin) {
    return (
      <View style={[tw`flex-1 justify-center items-center`, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={text} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: bgColor }]}>
      <View style={tw`p-6 flex-row justify-between items-center`}>
        <View>
          <Text style={[tw`text-3xl font-bold`, { color: text }]}>Admin Panel</Text>
          <Text style={[tw`text-base opacity-70`, { color: text }]}>Manage mealsList collection</Text>
        </View>
        <TouchableOpacity 
          onPress={() => { resetForm(); setEditingRecipe(null); setModalVisible(true); }}
          style={[tw`p-3 rounded-full`, { backgroundColor: text }]}
        >
          <Ionicons name="add" size={24} color={bgColor} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={text} style={tw`mt-10`} />
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={tw`px-6 pb-10`}
          renderItem={({ item }) => (
            <View style={[tw`p-4 mb-3 rounded-2xl flex-row justify-between items-center`, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <View style={tw`flex-1`}>
                <Text style={[tw`text-lg font-bold`, { color: text }]}>{item.title}</Text>
                <Text style={[tw`text-sm opacity-60`, { color: text }]}>{item.category}</Text>
              </View>
              <View style={tw`flex-row`}>
                <TouchableOpacity onPress={() => openEdit(item)} style={tw`p-2 mr-2`}>
                  <Ionicons name="pencil" size={20} color={text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={tw`p-2`}>
                  <Ionicons name="trash" size={20} color="#FF4B4B" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={[tw`flex-1`, { backgroundColor: text }]}>
          <View style={tw`p-6 flex-row justify-between items-center`}>
            <Text style={[tw`text-2xl font-bold`, { color: bgColor }]}>
              {editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color={bgColor} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={tw`px-6`}>
            <Text style={tw`mb-1 font-bold`}>Title</Text>
            <TextInput 
              style={[tw`p-3 rounded-xl mb-4`, { backgroundColor: 'rgba(0,0,0,0.05)' }]}
              value={formData.title}
              onChangeText={(t) => setFormData({...formData, title: t})}
            />
            
            <Text style={tw`mb-1 font-bold`}>Category</Text>
            <TextInput 
              style={[tw`p-3 rounded-xl mb-4`, { backgroundColor: 'rgba(0,0,0,0.05)' }]}
              value={formData.category}
              onChangeText={(t) => setFormData({...formData, category: t})}
            />

            <Text style={tw`mb-1 font-bold`}>Image URL</Text>
            <TextInput 
              style={[tw`p-3 rounded-xl mb-4`, { backgroundColor: 'rgba(0,0,0,0.05)' }]}
              value={formData.img}
              onChangeText={(t) => setFormData({...formData, img: t})}
            />

            <View style={tw`flex-row justify-between`}>
              <View style={tw`flex-1 mr-2`}>
                <Text style={tw`mb-1 font-bold`}>Prep Time</Text>
                <TextInput 
                  style={[tw`p-3 rounded-xl mb-4`, { backgroundColor: 'rgba(0,0,0,0.05)' }]}
                  value={formData.prepTime}
                  onChangeText={(t) => setFormData({...formData, prepTime: t})}
                />
              </View>
              <View style={tw`flex-1 ml-2`}>
                <Text style={tw`mb-1 font-bold`}>Cook Time</Text>
                <TextInput 
                  style={[tw`p-3 rounded-xl mb-4`, { backgroundColor: 'rgba(0,0,0,0.05)' }]}
                  value={formData.cookTime}
                  onChangeText={(t) => setFormData({...formData, cookTime: t})}
                />
              </View>
            </View>

            <Text style={tw`mb-1 font-bold`}>Description</Text>
            <TextInput 
              multiline
              style={[tw`p-3 rounded-xl mb-4 h-24`, { backgroundColor: 'rgba(0,0,0,0.05)', textAlignVertical: 'top' }]}
              value={formData.description}
              onChangeText={(t) => setFormData({...formData, description: t})}
            />

            <Text style={tw`mb-1 font-bold`}>Ingredients (comma separated)</Text>
            <TextInput 
              multiline
              style={[tw`p-3 rounded-xl mb-4 h-24`, { backgroundColor: 'rgba(0,0,0,0.05)', textAlignVertical: 'top' }]}
              value={formData.ingredients}
              onChangeText={(t) => setFormData({...formData, ingredients: t})}
            />

            <Text style={tw`mb-1 font-bold`}>Instructions (one per line)</Text>
            <TextInput 
              multiline
              style={[tw`p-3 rounded-xl mb-4 h-32`, { backgroundColor: 'rgba(0,0,0,0.05)', textAlignVertical: 'top' }]}
              value={formData.instructions}
              onChangeText={(t) => setFormData({...formData, instructions: t})}
            />

            <TouchableOpacity 
              onPress={handleSave}
              style={[tw`py-4 rounded-2xl items-center mb-10`, { backgroundColor: bgColor }]}
            >
              <Text style={[tw`text-lg font-bold`, { color: text }]}>
                {editingRecipe ? 'Update Recipe' : 'Add Recipe'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminManage;
