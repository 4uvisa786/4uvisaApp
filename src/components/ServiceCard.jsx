import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
// Assuming Colors is defined in '../themes/color'
import Colors from '../themes/color'; 

export const ServiceCard = ({
  imageURL,
  title,
  description,
  subServices,
  scrollSpeed,
  onPress,
}) => {
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const scrollViewRef = React.useRef();

  // State to hold the necessary widths for the infinite scroll logic
  const [containerWidth, setContainerWidth] = React.useState(0);
  // Width of a single copy of the content (A), which is the animation target
  const [singleContentWidth, setSingleContentWidth] = React.useState(0); 

  // FIX 1: Simplify duplication to just two copies (A + A)
  const duplicatedSubServices =
    subServices && subServices.length > 0
      ? [...subServices, ...subServices]
      : [];
  
  // We need to ensure we have content before running the animation logic
  const shouldAnimate = duplicatedSubServices.length > 0;

  // --- Animation Logic ---

  // 1. Start scroll when singleContentWidth is known and content is wider than container
  React.useEffect(() => {
    // Check if there is content to scroll and if the content overflows the container
    if (shouldAnimate && singleContentWidth > 0 && singleContentWidth > containerWidth) {
      startAutoScroll();
    } else {
      scrollX.stopAnimation();
    }
    // Stop animation on unmount
    return () => scrollX.stopAnimation();
  }, [singleContentWidth, containerWidth, shouldAnimate]);

  const SCROLL_SPEED = scrollSpeed; // pixels per second (tweak: 20–40 ideal)

 const startAutoScroll = () => {
  scrollX.setValue(0);

  const duration =
    (singleContentWidth / SCROLL_SPEED) * 1000; // ms

  Animated.loop(
    Animated.timing(scrollX, {
      toValue: singleContentWidth,
      duration,
      useNativeDriver: false,
      easing: Easing.linear,
    })
  ).start();
};


  // 2. Sync the Animated Value to the ScrollView position
  React.useEffect(() => {
    const id = scrollX.addListener(({ value }) => {
      // Manually set the scroll position based on the animated value
      if (scrollViewRef.current) {
         scrollViewRef.current.scrollTo({ x: value, animated: false });
      }
    });

    return () => scrollX.removeListener(id);
  }, [scrollX]); 

  // --- Render ---

  return (
    <View style={cardStyles.cardWrapper}>
      <TouchableOpacity
        style={cardStyles.cardContainer}
        onPress={onPress}
        activeOpacity={0.95}
      >
        <View style={cardStyles.card}>
          {/* Image Section (Unchanged) */}
          <View style={cardStyles.imageContainer}>
            {imageURL ? (
              <>
                <Image source={{ uri: imageURL }} style={cardStyles.image} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.4)']}
                  style={cardStyles.imageGradient}
                />
              </>
            ) : (
              <LinearGradient
                colors={[Colors.primaryLight, Colors.primary]}
                style={cardStyles.placeholderImage}
              >
                <Text style={cardStyles.placeholderText}>🌍</Text>
              </LinearGradient>
            )}
          </View>

          {/* Content (Unchanged) */}
          <View style={cardStyles.contentContainer}>
            <Text style={cardStyles.title} numberOfLines={1}>
              {title}
            </Text>

            <Text style={cardStyles.description} numberOfLines={2}>
              {description}
            </Text>

            {/* Auto-scroll sub-services */}
            {shouldAnimate && (
              <View
                style={cardStyles.subServicesBadge}
                // Determine the visible container width
                onLayout={(e) =>
                  // Subtract padding/icon width from total layout width
                  setContainerWidth(e.nativeEvent.layout.width - 20) 
                }
              >
                <Text style={cardStyles.subServicesIcon}>🌐</Text>

                <Animated.ScrollView
                  ref={scrollViewRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  scrollEnabled={false} // Disable manual scrolling
                  // Determine the total content size (A + A)
                  onContentSizeChange={(width) => {
                       // FIX 2: Since we only duplicated once (A+A), divide total width by 2
                       setSingleContentWidth(width / 2);
                  }}
                  style={{ marginLeft: 6 }}
                >
                  {/* Render duplicated list for infinite effect */}
                  {duplicatedSubServices.map((item, index) => (
                    <Text 
                        // Use a unique key based on item ID and index
                        key={item._id ? item._id + index : index} 
                        style={cardStyles.subServicesText}
                    >
                      {/* Using optional chaining for safety */}
                      {item?.name} •
                    </Text>
                  ))}
                </Animated.ScrollView>
              </View>
            )}
          </View>

          {/* Top Accent (Unchanged) */}
          <View style={cardStyles.topAccent} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const cardStyles = StyleSheet.create({
  cardWrapper: {
    width: '48%',
    marginBottom: 18,
  },
  cardContainer: {
    borderRadius: 16,
    backgroundColor: Colors.cardBg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.cardBg,
  },
  imageContainer: {
    width: '100%',
    height: 110,
    position: 'relative',
    backgroundColor: Colors.background,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
  },
  contentContainer: {
    padding: 14,
    minHeight: 105,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 6,
  },
  description: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  subServicesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.accent,
    overflow: 'hidden',
  },
  subServicesIcon: {
    fontSize: 12,
    color: Colors.primary,
  },
  subServicesText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    marginRight: 8,
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.secondary,
  },
});
