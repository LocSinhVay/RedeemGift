import React from 'react';
import { Image, ImageProps } from 'react-native';

export default function Avatar(props: ImageProps & { size?: number }) {
    const size = props.size ?? 40;
    return <Image {...props} style={[{ width: size, height: size, borderRadius: size / 2 }, props.style]} />;
}
