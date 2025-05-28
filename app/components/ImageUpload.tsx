import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ImageUploadProps {
    onImageSelected: (uri: string) => void;
    onFileSelected?: (file: File | null) => void;
    currentImage?: string;
    className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelected, currentImage, className = "", onFileSelected }) => {

    const triggerFileSelect = async () => {
        if (Platform.OS === 'web') {
            // Web: input file nativo
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';

            input.onchange = async (event: any) => {
                const file = event.target.files[0];
                if (!file) return;

                try {
                    // Compressão (web)
                    const compressedBlob = await imageCompression(file, {
                        maxSizeMB: 0.5,
                        maxWidthOrHeight: 800,
                        useWebWorker: true,
                    });

                    const compressedFile = new File([compressedBlob], file.name, {
                        type: compressedBlob.type,
                    });

                    // Cria preview url (blob)
                    const previewUrl = URL.createObjectURL(compressedFile);

                    onImageSelected(previewUrl);
                    if (onFileSelected) onFileSelected(compressedFile);
                } catch (error) {
                    console.error("Erro ao comprimir imagem:", error);
                }
            };

            input.click();

        } else {
            // Mobile: expo-image-picker
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                alert("Permissão para acessar a galeria é necessária!");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.7,
                aspect: [1, 1],
                base64: false,
            });

            if (result.canceled) return;

            const uri = result.assets && result.assets.length > 0 ? result.assets[0].uri : null;
            if (uri) {
                onImageSelected(uri);
            }
            // No RN não temos File, então passa null
            if (onFileSelected) onFileSelected(null);
        }
    };

    return (
        <View style={[styles.container]}>
            <TouchableOpacity onPress={triggerFileSelect} style={styles.imageContainer}>
                {currentImage ? (
                    <Image source={{ uri: currentImage }} style={styles.image} />
                ) : (
                    <View style={styles.placeholder}>
                        <Camera size={40} color="#9ca3af" />
                        <Text style={styles.placeholderText}>Adicionar Foto</Text>
                    </View>
                )}
            </TouchableOpacity>

            {currentImage && (
                <TouchableOpacity onPress={triggerFileSelect} style={styles.button}>
                    <Text style={styles.buttonText}>Alterar Foto</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        gap: 16,
    },
    imageContainer: {
        width: 128,
        height: 128,
        borderRadius: 64,
        borderWidth: 2,
        borderColor: "#9ca3af",
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: "#f9fafb",
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 64,
    },
    placeholder: {
        justifyContent: "center",
        alignItems: "center",
    },
    placeholderText: {
        color: "#9ca3af",
        fontSize: 12,
        marginTop: 8,
        textAlign: "center",
        paddingHorizontal: 8,
    },
    button: {
        backgroundColor: "#2563eb",
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 9999,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    },
});


export default ImageUpload;