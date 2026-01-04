export type RootStackParamList = {
  Login: undefined;
  MainDrawer: {
    screen: keyof DrawerParamList; // If you have a drawer navigator type
    params?: any;
  };
  Splash:undefined
};

export type DrawerParamList = {
  Dashboard: undefined;
  Analyze: undefined;
  ChartOption2: undefined;
  ChartOption3: undefined;
};
