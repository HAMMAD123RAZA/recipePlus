import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

export const fetchMeals = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "mealsList"));
    
    const meals = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return meals;
    
  } catch (error) {
    console.error("Error fetching meals:", error);
    return [];
  }
};



export const fetchCat = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "category"));
    
    const Cat = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return Cat;
    
  } catch (error) {
    console.error("Error fetching meals:", error);
    return [];
  }
};


