declare module 'react-native-speedometer-chart' {
  import { ComponentType } from 'react';
  import { ViewProps, TextStyle } from 'react-native';

  interface SpeedometerProps extends ViewProps {
    value: number;
    totalValue: number;
    size?: number;
    outerColor?: string;
    internalColor?: string;
    showText?: boolean;
    text?: string;
    showLabels?: boolean;
    labelStyle?: TextStyle;
      labelFormatter?: (number) => string;
  }

  const Speedometer: ComponentType<SpeedometerProps>;
  export default Speedometer;
}
