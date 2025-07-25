// src/navigation/NavigationService.ts
import { createNavigationContainerRef } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  FoodLogs: undefined;
  Movements: undefined;
  Activity: undefined;
  ChatHome: undefined;
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate<T extends keyof RootStackParamList>(
  name: T,
  params?: RootStackParamList[T]
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
