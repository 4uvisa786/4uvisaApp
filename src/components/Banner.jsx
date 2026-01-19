import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../themes/color';

export const Banner = ({ onPress }) => {
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.bannerWrapper,
        {
          opacity: slideAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.bannerContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative pattern */}
        <View style={styles.patternContainer}>
          <Text style={styles.patternEmoji}>✈️</Text>
        </View>

        {/* Content */}
        <View style={styles.contentWrapper}>
          <View style={styles.headerRow}>
            <View style={styles.iconCircle}>
              <Text style={styles.bannerEmoji}>🌏</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.bannerTitle}>Your Journey Starts Here</Text>
              <Text style={styles.bannerSubtitle}>
                Fast visa processing for 180+ countries
              </Text>
            </View>
          </View>

          {/* Bottom Row */}
          <View style={styles.bottomRow}>
            <TouchableOpacity
              style={styles.bannerButton}
              onPress={onPress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Colors.secondary, Colors.secondaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.bannerButtonText}>Apply Now →</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.trustText}>✓ 50K+ travelers</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bannerWrapper: {
    marginHorizontal: 20,
    marginTop: 12,
  },
  bannerContainer: {
    padding: 14,
    borderRadius: 14,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  patternContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    opacity: 0.08,
  },
  patternEmoji: {
    fontSize: 50,
    transform: [{ rotate: '15deg' }],
  },
  contentWrapper: {
    zIndex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 10,
  },
  bannerEmoji: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textLight,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 15,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerButton: {
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bannerButtonText: {
    color: Colors.textLight,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  trustText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 10,
    fontWeight: '600',
  },
});


// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Animated,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import Colors from '../themes/color';

// export const Banner = ({ onPress }) => {
//   const slideAnim = React.useRef(new Animated.Value(0)).current;

//   React.useEffect(() => {
//     Animated.timing(slideAnim, {
//       toValue: 1,
//       duration: 800,
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   return (
//     <Animated.View
//       style={[
//         styles.bannerWrapper,
//         {
//           opacity: slideAnim,
//           transform: [
//             {
//               translateY: slideAnim.interpolate({
//                 inputRange: [0, 1],
//                 outputRange: [20, 0],
//               }),
//             },
//           ],
//         },
//       ]}
//     >
//       <LinearGradient
//         colors={[Colors.primary, Colors.primaryDark]}
//         style={styles.bannerContainer}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//       >
//         {/* Decorative pattern */}
//         <View style={styles.patternContainer}>
//           <Text style={styles.patternEmoji}>✈️</Text>
//           <Text style={styles.patternEmoji2}>🌍</Text>
//         </View>

//         {/* Content */}
//         <View style={styles.contentWrapper}>
//           <View style={styles.iconCircle}>
//             <Text style={styles.bannerEmoji}>🌏</Text>
//           </View>

//           <Text style={styles.bannerTitle}>Your Journey Starts Here</Text>
//           <Text style={styles.bannerSubtitle}>
//             Fast visa processing for 180+ countries
//           </Text>

//           {/* CTA Button */}
//           <TouchableOpacity
//             style={styles.bannerButton}
//             onPress={onPress}
//             activeOpacity={0.8}
//           >
//             <LinearGradient
//               colors={[Colors.secondary, Colors.secondaryLight]}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 0 }}
//               style={styles.buttonGradient}
//             >
//               <Text style={styles.bannerButtonText}>Apply Now</Text>
//               <Text style={styles.bannerButtonArrow}>→</Text>
//             </LinearGradient>
//           </TouchableOpacity>

//           {/* Trust indicator */}
//           <View style={styles.trustBadge}>
//             <Text style={styles.trustText}>✓ Trusted by 50,000+ travelers</Text>
//           </View>
//         </View>
//       </LinearGradient>
//     </Animated.View>
//   );
// };

// const styles = StyleSheet.create({
//   bannerWrapper: {
//     marginHorizontal: 20,
//     marginTop: 14,
//   },
//   bannerContainer: {
//     padding: 16,
//     borderRadius: 16,
//     position: 'relative',
//     overflow: 'hidden',
//     shadowColor: Colors.primary,
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.28,
//     shadowRadius: 10,
//     elevation: 8,
//   },
//   patternContainer: {
//     position: 'absolute',
//     top: 0,
//     right: 0,
//     opacity: 0.08,
//   },
//   patternEmoji: {
//     fontSize: 65,
//     position: 'absolute',
//     right: -8,
//     top: -12,
//     transform: [{ rotate: '15deg' }],
//   },
//   patternEmoji2: {
//     fontSize: 50,
//     position: 'absolute',
//     right: 55,
//     top: 65,
//     transform: [{ rotate: '-10deg' }],
//   },
//   contentWrapper: {
//     zIndex: 1,
//   },
//   iconCircle: {
//     width: 52,
//     height: 52,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     borderRadius: 26,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 12,
//     borderWidth: 2,
//     borderColor: 'rgba(255, 255, 255, 0.3)',
//   },
//   bannerEmoji: {
//     fontSize: 26,
//   },
//   bannerTitle: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: Colors.textLight,
//     marginBottom: 6,
//     letterSpacing: 0.3,
//   },
//   bannerSubtitle: {
//     fontSize: 13,
//     color: 'rgba(255, 255, 255, 0.9)',
//     marginBottom: 14,
//     lineHeight: 18,
//   },
//   bannerButton: {
//     alignSelf: 'flex-start',
//     borderRadius: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.25,
//     shadowRadius: 5,
//     elevation: 5,
//     marginBottom: 10,
//   },
//   buttonGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 10,
//   },
//   bannerButtonText: {
//     color: Colors.textLight,
//     fontWeight: '800',
//     fontSize: 14,
//     letterSpacing: 0.4,
//   },
//   bannerButtonArrow: {
//     color: Colors.textLight,
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginLeft: 6,
//   },
//   trustBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   trustText: {
//     color: 'rgba(255, 255, 255, 0.85)',
//     fontSize: 11,
//     fontWeight: '600',
//   },
// });
