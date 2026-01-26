import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { doc, getDoc } from '@firebase/firestore'
import { db } from '../utils/firebase'
import tw from 'twrnc'
import { text ,bgColor} from '@/constants/theme';
import { Image } from 'expo-image'

const Id = () => {
  const { id } = useLocalSearchParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    try {
      setLoading(true)
      const info = doc(db, 'mealsList', id)
      const infoSnap = await getDoc(info)
      if (infoSnap.exists()) {
        const data = infoSnap.data()
        setData(data)
      } else {
        console.log('No documents found')
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  // Function to format ingredients into array if they're stored as string
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
        <View style={tw`w-full h-64`}>
          {data.img ? (
            <Image 
              source={data?.img} 
              style={tw`w-full h-full`}
              resizeMode="cover"
            />
          ) : (
            <View style={[tw`w-full h-full justify-center items-center`, { backgroundColor: '#333' }]}>
              <Text style={[tw`text-base`, { color: text }]}>No Image</Text>
            </View>
          )}
        </View>

        {/* Recipe Title and Basic Info */}
        <View style={tw`px-5 pb-25`}>
          <Text style={[tw`text-2xl font-bold mb-4`, { color: text }]}>
            {data.title || 'Untitled Recipe'}
          </Text>
          
          <View style={[tw`flex-row justify-between bg-opacity-10 rounded-xl p-4 mb-5`, { backgroundColor: text }]}>
            <View style={tw`items-center`}>
              <Text style={[tw`text-xs opacity-80 mb-1`, { color: text }]}>Prep Time</Text>
              <Text style={[tw`text-base font-semibold`, { color: text }]}>
                {data.prepTime || 'N/A'}
              </Text>
            </View>
            <View style={tw`items-center`}>
              <Text style={[tw`text-xs opacity-80 mb-1`, { color: text }]}>Cook Time</Text>
              <Text style={[tw`text-base font-semibold`, { color: text }]}>
                {data.cookTime || 'N/A'}
              </Text>
            </View>
            <View style={tw`items-center`}>
              <Text style={[tw`text-xs opacity-80 mb-1`, { color: text }]}>Servings</Text>
              <Text style={[tw`text-base font-semibold`, { color: text }]}>
                {data.servings || 'N/A'}
              </Text>
            </View>
          </View>

          {/* Description */}
          {data.description && (
            <View style={tw`mb-6`}>
              <Text style={[tw`text-xl font-bold mb-4 border-b-2 pb-1`, { color: text, borderColor: text }]}>
                Description
              </Text>
              <Text style={[tw`text-base leading-6`, { color: text }]}>
                {data.description}
              </Text>
            </View>
          )}

          {/* Ingredients */}
          <View style={tw`mb-6`}>
            <Text style={[tw`text-xl font-bold mb-4 border-b-2 pb-1`, { color: text, borderColor: text }]}>
              Ingredients
            </Text>
            {formatIngredients(data.ingredients).map((ingredient, index) => (
              <View key={index} style={tw`flex-row items-start mb-2.5`}>
                <View style={[tw`w-1.5 h-1.5 rounded-full mt-2.5 mr-2.5`, { backgroundColor: text }]} />
                <Text style={[tw`flex-1 text-base leading-6`, { color: text }]}>
                  {ingredient.trim()}
                </Text>
              </View>
            ))}
          </View>

          {/* Instructions */}
          {data.instructions && (
            <View style={tw`mb-6`}>
              <Text style={[tw`text-xl font-bold mb-4 border-b-2 pb-1`, { color: text, borderColor: text }]}>
                Instructions
              </Text>
              {Array.isArray(data.instructions) ? (
                data.instructions.map((step, index) => (
                  <View key={index} style={tw`flex-row mb-4`}>
                    <View style={[tw`w-8 h-8 rounded-full justify-center items-center mr-2.5`, { backgroundColor: text }]}>
                      <Text style={{ color: bgColor, fontWeight: 'bold', fontSize: 14 }}>
                        {index + 1}
                      </Text>
                    </View>
                    <Text style={[tw`flex-1 text-base leading-6`, { color: text }]}>
                      {step}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={[tw`text-base leading-6`, { color: text }]}>
                  {data.instructions}
                </Text>
              )}
            </View>
          )}

          {/* Notes */}
          {data.notes && (
            <View style={tw`mb-6`}>
              <Text style={[tw`text-xl font-bold mb-4 border-b-2 pb-1`, { color: text, borderColor: text }]}>
                Notes
              </Text>
              <Text style={[tw`text-base leading-6 italic`, { color: text }]}>
                {data.notes}
              </Text>
            </View>
          )}

          {/* Spacer for bottom button */}
          <View style={tw`h-5`} />
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={tw`absolute bottom-0 left-0 right-0 p-5`}>
        <TouchableOpacity 
          style={[
            tw`bg-[${text}] rounded-xl py-4.5 items-center`,
            {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }
          ]}
          onPress={() => {
            // Add your onPress function here later
            console.log('Save button pressed')
          }}
          activeOpacity={0.8}
        >
          <Text style={[tw`text-lg font-bold`, { color: bgColor }]}>
            Save Recipe
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default Id