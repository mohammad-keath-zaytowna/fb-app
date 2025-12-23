import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useCartContext } from '@/contexts/CartContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Tabs } from 'expo-router';
import { List, Package, Plus, ShoppingBag, User } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { getCartCount } = useCartContext();
  const count = getCartCount();
  const { t } = useTranslation();

  // Prevent going back to auth screens after login
  useEffect(() => {
    const backAction = () => {
      // Return true to prevent default back action (going back)
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="products"
        options={{
          title: t('products'),
          tabBarIcon: ({ color }) => <Package size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t('shoppingCart'),
          tabBarIcon: ({ color }) => <ShoppingBag size={24} color={color} />,
          tabBarBadge: count > 0 ? count : undefined,
        }}
      />
      <Tabs.Screen
        name="add-product"
        options={{
          title: t('addNewProduct'),
          tabBarIcon: ({ color }) => <Plus size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t('myOrders'),
          tabBarIcon: ({ color }) => <List size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

