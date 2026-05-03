import { memo, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, Animated } from 'react-native';
import { Place } from '../types';

const formatDistance = (distance: number | undefined): string => {
  if (!distance) return '';
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  }
  return `${(distance / 1000).toFixed(1)}km`;
};

const PlaceCard = ({ place, type, index }: { place: Place; type: 'beach' | 'mountain'; index: number }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    const delay = 300 + index * 80;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 15,
        stiffness: 100,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      damping: 15,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      damping: 15,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  };

  const icon = type === 'beach' ? '🏖️' : '⛰️';
  const bgColor = type === 'beach' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(52, 211, 153, 0.2)';

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }, { scale: scaleAnim }] }]}>
      <Pressable
        style={styles.card}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {place.name}
          </Text>
          {place.location?.address && (
            <Text style={styles.address} numberOfLines={1}>
              {place.location.address}
            </Text>
          )}
        </View>

        {place.distance !== undefined && (
          <View style={styles.distanceContainer}>
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>
                {formatDistance(place.distance)}
              </Text>
            </View>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const CategorySection = ({
  title,
  icon,
  count,
  places,
  type,
  index,
}: {
  title: string;
  icon: string;
  count: number;
  places: Place[];
  type: 'beach' | 'mountain';
  index: number;
}) => {
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    const delay = 300 + index * 150;
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(headerTranslateY, {
        toValue: 0,
        damping: 15,
        stiffness: 100,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.section}>
      <Animated.View style={[styles.sectionHeader, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
        <View style={[styles.sectionIcon, { backgroundColor: type === 'beach' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(52, 211, 153, 0.2)' }]}>
          <Text style={styles.sectionIconText}>{icon}</Text>
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCount}>{count} cercanas</Text>
      </Animated.View>

      <View style={styles.cardsContainer}>
        {places.map((place, i) => (
          <PlaceCard key={place.fsq_place_id} place={place} type={type} index={i} />
        ))}
      </View>
    </View>
  );
};

export const PlacesList = ({
  beaches,
  mountains,
}: {
  beaches: Place[];
  mountains: Place[];
}) => {
  const visibleBeaches = useMemo(() => beaches.slice(0, 3), [beaches]);
  const visibleMountains = useMemo(() => mountains.slice(0, 3), [mountains]);

  if (beaches.length === 0 && mountains.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {visibleBeaches.length > 0 && (
        <CategorySection
          title="Playas"
          icon="🏖️"
          count={beaches.length}
          places={visibleBeaches}
          type="beach"
          index={0}
        />
      )}

      {visibleMountains.length > 0 && (
        <CategorySection
          title="Natureza"
          icon="⛰️"
          count={mountains.length}
          places={visibleMountains}
          type="mountain"
          index={1}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIconText: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  sectionCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    marginLeft: 'auto',
  },
  cardsContainer: {
    gap: 8,
  },
card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  address: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  distanceContainer: {
    alignItems: 'flex-end',
  },
  distanceBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
});
