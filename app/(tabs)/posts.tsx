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
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove 
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from '../utils/AuthContext';
import { text, bgColor } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import tw from 'twrnc';

const Posts = () => {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'communityPosts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreatePost = async () => {
    if (!user) {
      Alert.alert(
        "Login Required", 
        "Please sign in to share a post.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => {
            setModalVisible(false);
            router.push('/auth/login');
          }}
        ]
      );
      return;
    }
    if (!newPost.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'communityPosts'), {
        userId: user.uid,
        userName: userData?.email?.split('@')[0] || 'Anonymous',
        content: newPost,
        likes: [],
        createdAt: serverTimestamp()
      });
      setNewPost('');
      setModalVisible(false);
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "Failed to create post.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId, likes) => {
    if (!user) {
      Alert.alert(
        "Login Required", 
        "Please sign in to like posts.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => router.push('/auth/login') }
        ]
      );
      return;
    }

    const postRef = doc(db, 'communityPosts', postId);
    const isLiked = likes.includes(user.uid);

    try {
      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const renderPost = ({ item }) => {
    const isLiked = item.likes?.includes(user?.uid);
    
    return (
      <View style={[tw`p-4 mb-4 rounded-2xl`, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
        <View style={tw`flex-row items-center mb-2`}>
          <View style={[tw`w-10 h-10 rounded-full justify-center items-center mr-3`, { backgroundColor: text }]}>
            <Text style={{ color: bgColor, fontWeight: 'bold' }}>{item.userName[0].toUpperCase()}</Text>
          </View>
          <View>
            <Text style={[tw`font-bold`, { color: text }]}>{item.userName}</Text>
            <Text style={[tw`text-xs opacity-50`, { color: text }]}>
              {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Just now'}
            </Text>
          </View>
        </View>
        
        <Text style={[tw`text-base mb-4`, { color: text }]}>{item.content}</Text>
        
        <View style={tw`flex-row items-center border-t border-white border-opacity-10 pt-3`}>
          <TouchableOpacity 
            onPress={() => handleLike(item.id, item.likes || [])}
            style={tw`flex-row items-center mr-6`}
          >
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={22} 
              color={isLiked ? "#FF4B4B" : text} 
            />
            <Text style={[tw`ml-1.5 font-semibold`, { color: isLiked ? "#FF4B4B" : text }]}>
              {item.likes?.length || 0}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={tw`flex-row items-center`}>
            <Ionicons name="chatbubble-outline" size={20} color={text} />
            <Text style={[tw`ml-1.5`, { color: text }]}>Comment</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[tw`flex-1 pt-12`, { backgroundColor: bgColor }]}>
      <View style={tw`px-6 mb-6 flex-row justify-between items-center`}>
        <View>
          <Text style={[tw`text-3xl font-bold`, { color: text }]}>Community</Text>
          <Text style={[tw`text-base opacity-70`, { color: text }]}>Share your cooking journey</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          style={[tw`p-3 rounded-full`, { backgroundColor: text }]}
        >
          <Ionicons name="add" size={24} color={bgColor} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color={text} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          contentContainerStyle={tw`px-6 pb-10`}
          ListEmptyComponent={() => (
            <View style={tw`mt-20 items-center`}>
              <Ionicons name="chatbubbles-outline" size={64} color={text} style={tw`opacity-20`} />
              <Text style={[tw`mt-4 text-lg opacity-50 text-center`, { color: text }]}>
                No posts yet. Be the first to share!
              </Text>
            </View>
          )}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={tw`flex-1 justify-end`}
        >
          <View style={[tw`rounded-t-3xl p-6`, { backgroundColor: text, height: '60%' }]}>
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <Text style={[tw`text-2xl font-bold`, { color: bgColor }]}>Create Post</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={bgColor} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              multiline
              placeholder="What's cooking? Share your recipe or tips..."
              placeholderTextColor="rgba(0,0,0,0.4)"
              style={[tw`flex-1 text-lg p-4 rounded-2xl mb-6`, { backgroundColor: 'rgba(0,0,0,0.05)', textAlignVertical: 'top' }]}
              value={newPost}
              onChangeText={setNewPost}
            />
            
            <TouchableOpacity 
              onPress={handleCreatePost}
              disabled={submitting}
              style={[tw`py-4 rounded-2xl items-center`, { backgroundColor: bgColor }]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={text} />
              ) : (
                <Text style={[tw`text-lg font-bold`, { color: text }]}>Post to Community</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default Posts;
