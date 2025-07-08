import React from 'react';
import { TouchableWithoutFeedback, StyleSheet, View, Pressable } from 'react-native';
import { Icon, Input, Text, IconElement } from '@ui-kitten/components';

const AlertIcon = (props: any): IconElement => (
  <Icon
    {...props}
    name='alert-circle-outline'
  />
);

interface InputPasswordProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  captionText?: string;
  [key: string]: any;
}

const InputPassword: React.FC<InputPasswordProps> = ({ value, onChangeText, label = 'Senha', placeholder = 'Enter your password', captionText = 'Should contain at least 8 symbols', ...props }) => {
  const [secureTextEntry, setSecureTextEntry] = React.useState(true);

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const renderInputIcon = (props: any): React.ReactElement => (
    <Pressable onPress={toggleSecureEntry}>
      <Icon
        {...props}
        name={!secureTextEntry ? 'eye' : 'eye-off'}
      />
    </Pressable>
  );

  return (
    <Input
      value={value}
      label={label}
      placeholder={placeholder}
      accessoryRight={(props: any) => renderInputIcon(props)}
      secureTextEntry={secureTextEntry}
      onChangeText={onChangeText}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  captionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  captionIcon: {
    width: 10,
    height: 10,
    marginRight: 5,
  },
  captionText: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'opensans-regular',
    color: '#8F9BB3',
  },
});

export default InputPassword;
