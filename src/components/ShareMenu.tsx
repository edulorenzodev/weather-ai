import { memo } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Share } from 'react-native';
import { useRouter } from 'expo-router';

const IoniconsIcon = require('@expo/vector-icons').Ionicons;

interface ShareMenuProps {
  visible: boolean;
  onClose: () => void;
  weatherText: string;
}

const ShareMenuComponent = ({ visible, onClose, weatherText }: ShareMenuProps) => {
  const router = useRouter();
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: weatherText,
      });
      onClose();
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleSettings = () => {
    onClose();
    router.push('/settings');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.menu} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Menú</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <IoniconsIcon name="close" size={20} color="rgba(255, 255, 255, 0.6)" />
            </Pressable>
          </View>
          
          <Pressable 
            style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
            onPress={handleShare}
          >
            <IoniconsIcon name="share-outline" size={22} color="white" />
            <Text style={styles.optionText}>Compartir clima actual</Text>
          </Pressable>
          
          <Pressable 
            style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
            onPress={handleSettings}
          >
            <IoniconsIcon name="settings-outline" size={22} color="white" />
            <Text style={styles.optionText}>Ajustes</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menu: {
    backgroundColor: '#1e3a5f',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 34,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  optionText: {
    fontSize: 16,
    color: 'white',
  },
});

export const ShareMenu = memo(ShareMenuComponent);