import { ScrollView, Text } from 'react-native'
import React from 'react'
import Header from '../components/home/header';
import Hero from '../components/hero/Hero';
import Slider from '../components/Slider/Slider';
import Category from '../components/Category/Category';

const Index = () => {
  return (
    <ScrollView
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{paddingBottom:10}}
    >
      <Header/>
      <Slider/>
      <Category/>
      <Hero/>
    </ScrollView>
  )
}

export default Index
