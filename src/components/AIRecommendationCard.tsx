import { memo, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform, Animated } from 'react-native';
import { AIRecommendation } from '../types';

const getActivityStyles = (activity: string) => {
  switch (activity) {
    case 'beach':
      return { gradient: '#f59e0b', icon: '🏖️', label: 'Playa' };
    case 'mountain':
      return { gradient: '#059669', icon: '⛰️', label: 'Montaña' };
    case 'home':
      return { gradient: '#7c3aed', icon: '🏠', label: 'Interior' };
    default:
      return { gradient: '#6b7280', icon: '🤔', label: 'General' };
  }
};

const LoadingState = () => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.card}>
      <View style={styles.contentRow}>
        <View style={styles.loadingIcon}>
          <ActivityIndicator size="small" color="#a78bfa" />
        </View>
        <View style={styles.loadingText}>
          <Text style={styles.loadingTitle}>Analizando...</Text>
          <Text style={styles.loadingSubtitle}>Buscando la mejor actividad</Text>
        </View>
      </View>
      <View style={styles.loadingBar}>
        <Animated.View 
          style={[
            styles.loadingProgress, 
            { 
              transform: [{ 
                translateX: shimmer.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-100, 200],
                })
              }] 
            }
          ]} 
        />
      </View>
    </View>
  );
};

const AIRecommendationCardComponent = ({
  recommendation,
  loading,
}: {
  recommendation: AIRecommendation | null;
  loading: boolean;
}) => {
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(20)).current;
  const iconScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 400,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.spring(cardTranslateY, {
        toValue: 0,
        damping: 15,
        stiffness: 100,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(300),
        Animated.spring(iconScale, {
          toValue: 1,
          damping: 10,
          stiffness: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (!recommendation) return null;

  const activityStyles = getActivityStyles(recommendation.activity);

  return (
    <Animated.View
      style={[
        styles.card, 
        { backgroundColor: activityStyles.gradient },
        { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] }
      ]}
    >
      <View style={styles.accentOverlay} />

      <View style={styles.contentRow}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: iconScale }] }]}>
          <Text style={styles.icon}>{activityStyles.icon}</Text>
        </Animated.View>

        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.label}>Recomendación IA</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activityStyles.label}</Text>
            </View>
          </View>
          <Text style={styles.title}>{recommendation.title}</Text>
          <Text style={styles.description}>{recommendation.description}</Text>
        </View>
      </View>

      <View style={styles.reasonContainer}>
        <View style={styles.lightbulb}>
          <Text style={styles.lightbulbEmoji}>💡</Text>
        </View>
        <Text style={styles.reason}>{recommendation.reason}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  accentOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 150,
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 75,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  lightbulb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightbulbEmoji: {
    fontSize: 12,
  },
  reason: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 20,
  },
  loadingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    flex: 1,
  },
  loadingTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  loadingBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginTop: 16,
    overflow: 'hidden',
  },
  loadingProgress: {
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
});

export const AIRecommendationCard = memo(AIRecommendationCardComponent);
