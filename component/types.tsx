export type RootStackParamList = {
  Main: { screen: keyof RootStackParamList; params?: any };
    MainTabs: { screen: keyof RootStackParamList; params?: any };

  Dashboard: undefined;

};
