import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  Alert
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { doc, getDoc, setDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../utils/firebase'
import { useAuth } from '../utils/AuthContext'
import tw from 'twrnc'
import { text, bgColor } from '@/constants/theme';
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'

const Id = () => {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getData()
  }, [id])

  const getData = async () => {
    try {
      setLoading(true)
      const info = doc(db, 'mealsList', id)
      const infoSnap = await getDoc(info)
      if (infoSnap.exists()) {
        setData({ id: infoSnap.id, ...infoSnap.data() })
      } else {
        console.log('No documents found')
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveRecipe = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please sign in to save recipes.");
      return;
    }

    try {
      setSaving(true);
      const saveRef = doc(db, 'save', `${user.uid}_${id}`);
      await setDoc(saveRef, {
        userId: user.uid,
        recipeId: id,
        recipeTitle: data.title,
        recipeImg: data.img,
        recipeCategory: data.category,
        savedAt: serverTimestamp()
      });
      Alert.alert("Success", "Recipe saved to your collection!");
    } catch (error) {
      console.error("Error saving recipe:", error);
      Alert.alert("Error", "Failed to save recipe. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const formatIngredients = (ingredients) => {
    if (!ingredients) return []
    if (Array.isArray(ingredients)) return ingredients
    if (typeof ingredients === 'string') return ingredients.split(',')
    return []
  }

  if (loading) {
    return (
      <View style={[tw`flex-1`, { backgroundColor: bgColor }, tw`justify-center items-center`]}>
        <ActivityIndicator size="large" color={text} />
        <Text style={[tw`mt-2.5 text-base`, { color: text }]}>Loading recipe...</Text>
      </View>
    )
  }

  if (!data) {
    return (
      <View style={[tw`flex-1`, { backgroundColor: bgColor }, tw`justify-center items-center`]}>
        <Text style={[tw`text-lg`, { color: text }]}>Recipe not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={tw`mt-4`}>
          <Text style={{ color: text, fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ backgroundColor: bgColor, flex: 1 }}>
      <ScrollView 
        style={tw`flex-1`}
        showsVerticalScrollIndicator={false}
      >
        {/* Recipe Image */}
        <View style={tw`w-full h-80 relative`}>
          {data.img ? (
            <Image 
              source={data?.img} 
              style={tw`w-full h-full`}
              contentFit="cover"
            />
          ) : (
            <View style={[tw`w-full h-full justify-center items-center`, { backgroundColor: 'rgba(0,0,0,0.1)' }]}>
              <Ionicons name="image-outline" size={64} color={text} />
            </View>
          )}
          
          {/* Back Button Overlay */}
          <TouchableOpacity 
            onPress={() => router.back()}
            style={[tw`absolute top-12 left-5 p-2 rounded-full`, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Recipe Content */}
        <View style={[tw`flex-1 -mt-8 rounded-t-3xl px-6 pt-8 pb-32`, { backgroundColor: bgColor }]}>
          <View style={tw`flex-row justify-between items-start mb-4`}>
            <View style={tw`flex-1 mr-2`}>
              <Text style={[tw`text-3xl font-bold`, { color: text }]}>
                {data.title || 'Untitled Recipe'}
              </Text>
              <Text style={[tw`text-lg opacity-70`, { color: text }]}>
                {data.category}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={handleSaveRecipe}
              disabled={saving}
              style={[tw`p-3 rounded-full`, { backgroundColor: text }]}
            >
              {saving ? (
                <ActivityIndicator size="small" color={bgColor} />
              ) : (
                <Ionicons name="bookmark-outline" size={24} color={bgColor} />
              )}
            </TouchableOpacity>
          </View>
          
          {/* Stats Row */}
          <View style={[tw`flex-row justify-between rounded-2xl p-4 mb-8`, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <View style={tw`items-center flex-1`}>
              <Ionicons name="time-outline" size={20} color={text} />
              <Text style={[tw`text-xs opacity-60 mt-1`, { color: text }]}>Prep</Text>
              <Text style={[tw`text-sm font-bold`, { color: text }]}>{data.prepTime || '15m'}</Text>
            </View>
            <View style={[tw`w-0.5 h-10 self-center`, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
            <View style={tw`items-center flex-1`}>
              <Ionicons name="flame-outline" size={20} color={text} />
              <Text style={[tw`text-xs opacity-60 mt-1`, { color: text }]}>Cook</Text>
              <Text style={[tw`text-sm font-bold`, { color: text }]}>{data.cookTime || '30m'}</Text>
            </View>
            <View style={[tw`w-0.5 h-10 self-center`, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
            <View style={tw`items-center flex-1`}>
              <Ionicons name="people-outline" size={20} color={text} />
              <Text style={[tw`text-xs opacity-60 mt-1`, { color: text }]}>Serves</Text>
              <Text style={[tw`text-sm font-bold`, { color: text }]}>{data.servings || '4'}</Text>
            </View>
          </View>

          {/* Description */}
          {data.description && (
            <View style={tw`mb-8`}>
              <Text style={[tw`text-xl font-bold mb-3`, { color: text }]}>About this recipe</Text>
              <Text style={[tw`text-base leading-6 opacity-80`, { color: text }]}>
                {data.description}
              </Text>
            </View>
          )}

          {/* Ingredients */}
          <View style={tw`mb-8`}>
            <View style={tw`flex-row items-center mb-4`}>
              <Text style={[tw`text-xl font-bold`, { color: text }]}>Ingredients</Text>
              <View style={[tw`ml-3 px-2 py-0.5 rounded-md`, { backgroundColor: text }]}>
                <Text style={{ color: bgColor, fontSize: 12, fontWeight: 'bold' }}>
                  {formatIngredients(data.ingredients).length} items
                </Text>
              </View>
            </View>
            {formatIngredients(data.ingredients).map((ingredient, index) => (
              <View key={index} style={[tw`flex-row items-center mb-3 p-3 rounded-xl`, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                <View style={[tw`w-2 h-2 rounded-full mr-3`, { backgroundColor: text }]} />
                <Text style={[tw`flex-1 text-base`, { color: text }]}>
                  {ingredient.trim()}
                </Text>
              </View>
            ))}
          </View>

          {/* Instructions */}
          {data.instructions && (
            <View style={tw`mb-8`}>
              <Text style={[tw`text-xl font-bold mb-4`, { color: text }]}>Instructions</Text>
              {Array.isArray(data.instructions) ? (
                data.instructions.map((step, index) => (
                  <View key={index} style={tw`flex-row mb-6`}>
                    <View style={[tw`w-8 h-8 rounded-full justify-center items-center mr-4`, { backgroundColor: text }]}>
                      <Text style={{ color: bgColor, fontWeight: 'bold' }}>{index + 1}</Text>
                    </View>
                    <Text style={[tw`flex-1 text-base leading-6`, { color: text }]}>
                      {step}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={[tw`p-4 rounded-xl`, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                  <Text style={[tw`text-base leading-6`, { color: text }]}>
                    {data.instructions}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Save Button */}
      <View style={tw`absolute bottom-8 left-6 right-6`}>
        <TouchableOpacity 
          style={[
            tw`rounded-2xl py-4 items-center flex-row justify-center`,
            { backgroundColor: text, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65 }
          ]}
          onPress={handleSaveRecipe}
          disabled={saving}
          activeOpacity={0.9}
        >
          {saving ? (
            <ActivityIndicator size="small" color={bgColor} />
          ) : (
            <>
              <Ionicons name="bookmark" size={20} color={bgColor} style={tw`mr-2`} />
              <Text style={[tw`text-lg font-bold`, { color: bgColor }]}>
                Save to Collection
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default Id
