import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  Modal,
  SectionList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";

// --- Colors ---
const Colors = {
  primary: "#007AFF",
  textPrimary: "#1F2937",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  background: "#F9FAFB",
  cardBg: "#FFFFFF",
  border: "#E5E7EB",
};

// --- Helper Function ---
const getFlag = (countryCode) =>
  countryCode
    .replace(/./g, (char) =>
      String.fromCodePoint(char.charCodeAt(0) + 0x1f1a5)
    );

// --- Country Data ---
const allCountryCodes = [
  { country: "Afghanistan", code: "+93", flag: getFlag("AF") },
  { country: "Albania", code: "+355", flag: getFlag("AL") },
  { country: "Algeria", code: "+213", flag: getFlag("DZ") },
  { country: "American Samoa", code: "+1-684", flag: getFlag("AS") },
  { country: "Andorra", code: "+376", flag: getFlag("AD") },
  { country: "Angola", code: "+244", flag: getFlag("AO") },
  { country: "Anguilla", code: "+1-264", flag: getFlag("AI") },
  { country: "Argentina", code: "+54", flag: getFlag("AR") },
  { country: "Armenia", code: "+374", flag: getFlag("AM") },
  { country: "Australia", code: "+61", flag: getFlag("AU") },
  { country: "Austria", code: "+43", flag: getFlag("AT") },
  { country: "Azerbaijan", code: "+994", flag: getFlag("AZ") },
  { country: "Bahamas", code: "+1-242", flag: getFlag("BS") },
  { country: "Bahrain", code: "+973", flag: getFlag("BH") },
  { country: "Bangladesh", code: "+880", flag: getFlag("BD") },
  { country: "Barbados", code: "+1-246", flag: getFlag("BB") },
  { country: "Belarus", code: "+375", flag: getFlag("BY") },
  { country: "Belgium", code: "+32", flag: getFlag("BE") },
  { country: "Belize", code: "+501", flag: getFlag("BZ") },
  { country: "Benin", code: "+229", flag: getFlag("BJ") },
  { country: "Bhutan", code: "+975", flag: getFlag("BT") },
  { country: "Bolivia", code: "+591", flag: getFlag("BO") },
  { country: "Bosnia", code: "+387", flag: getFlag("BA") },
  { country: "Botswana", code: "+267", flag: getFlag("BW") },
  { country: "Brazil", code: "+55", flag: getFlag("BR") },
  { country: "Bulgaria", code: "+359", flag: getFlag("BG") },
  { country: "Cambodia", code: "+855", flag: getFlag("KH") },
  { country: "Cameroon", code: "+237", flag: getFlag("CM") },
  { country: "Canada", code: "+1", flag: getFlag("CA") },
  { country: "Chile", code: "+56", flag: getFlag("CL") },
  { country: "China", code: "+86", flag: getFlag("CN") },
  { country: "Colombia", code: "+57", flag: getFlag("CO") },
  { country: "Costa Rica", code: "+506", flag: getFlag("CR") },
  { country: "Cuba", code: "+53", flag: getFlag("CU") },
  { country: "Cyprus", code: "+357", flag: getFlag("CY") },
  { country: "Czech Republic", code: "+420", flag: getFlag("CZ") },
  { country: "Denmark", code: "+45", flag: getFlag("DK") },
  { country: "Dominican Republic", code: "+1-809", flag: getFlag("DO") },
  { country: "Ecuador", code: "+593", flag: getFlag("EC") },
  { country: "Egypt", code: "+20", flag: getFlag("EG") },
  { country: "El Salvador", code: "+503", flag: getFlag("SV") },
  { country: "Estonia", code: "+372", flag: getFlag("EE") },
  { country: "Ethiopia", code: "+251", flag: getFlag("ET") },
  { country: "Finland", code: "+358", flag: getFlag("FI") },
  { country: "France", code: "+33", flag: getFlag("FR") },
  { country: "Germany", code: "+49", flag: getFlag("DE") },
  { country: "Ghana", code: "+233", flag: getFlag("GH") },
  { country: "Greece", code: "+30", flag: getFlag("GR") },
  { country: "Greenland", code: "+299", flag: getFlag("GL") },
  { country: "Guatemala", code: "+502", flag: getFlag("GT") },
  { country: "Haiti", code: "+509", flag: getFlag("HT") },
  { country: "Honduras", code: "+504", flag: getFlag("HN") },
  { country: "Hong Kong", code: "+852", flag: getFlag("HK") },
  { country: "Hungary", code: "+36", flag: getFlag("HU") },
  { country: "Iceland", code: "+354", flag: getFlag("IS") },
  { country: "India", code: "+91", flag: getFlag("IN") },
  { country: "Indonesia", code: "+62", flag: getFlag("ID") },
  { country: "Iran", code: "+98", flag: getFlag("IR") },
  { country: "Iraq", code: "+964", flag: getFlag("IQ") },
  { country: "Ireland", code: "+353", flag: getFlag("IE") },
  { country: "Israel", code: "+972", flag: getFlag("IL") },
  { country: "Italy", code: "+39", flag: getFlag("IT") },
  { country: "Jamaica", code: "+1-876", flag: getFlag("JM") },
  { country: "Japan", code: "+81", flag: getFlag("JP") },
  { country: "Jordan", code: "+962", flag: getFlag("JO") },
  { country: "Kazakhstan", code: "+7", flag: getFlag("KZ") },
  { country: "Kenya", code: "+254", flag: getFlag("KE") },
  { country: "Kuwait", code: "+965", flag: getFlag("KW") },
  { country: "Kyrgyzstan", code: "+996", flag: getFlag("KG") },
  { country: "Laos", code: "+856", flag: getFlag("LA") },
  { country: "Latvia", code: "+371", flag: getFlag("LV") },
  { country: "Lebanon", code: "+961", flag: getFlag("LB") },
  { country: "Lesotho", code: "+266", flag: getFlag("LS") },
  { country: "Liberia", code: "+231", flag: getFlag("LR") },
  { country: "Libya", code: "+218", flag: getFlag("LY") },
  { country: "Lithuania", code: "+370", flag: getFlag("LT") },
  { country: "Luxembourg", code: "+352", flag: getFlag("LU") },
  { country: "Macau", code: "+853", flag: getFlag("MO") },
  { country: "Malaysia", code: "+60", flag: getFlag("MY") },
  { country: "Maldives", code: "+960", flag: getFlag("MV") },
  { country: "Mali", code: "+223", flag: getFlag("ML") },
  { country: "Malta", code: "+356", flag: getFlag("MT") },
  { country: "Mexico", code: "+52", flag: getFlag("MX") },
  { country: "Moldova", code: "+373", flag: getFlag("MD") },
  { country: "Monaco", code: "+377", flag: getFlag("MC") },
  { country: "Mongolia", code: "+976", flag: getFlag("MN") },
  { country: "Montenegro", code: "+382", flag: getFlag("ME") },
  { country: "Morocco", code: "+212", flag: getFlag("MA") },
  { country: "Mozambique", code: "+258", flag: getFlag("MZ") },
  { country: "Myanmar", code: "+95", flag: getFlag("MM") },
  { country: "Namibia", code: "+264", flag: getFlag("NA") },
  { country: "Nepal", code: "+977", flag: getFlag("NP") },
  { country: "Netherlands", code: "+31", flag: getFlag("NL") },
  { country: "New Zealand", code: "+64", flag: getFlag("NZ") },
  { country: "Nicaragua", code: "+505", flag: getFlag("NI") },
  { country: "Niger", code: "+227", flag: getFlag("NE") },
  { country: "Nigeria", code: "+234", flag: getFlag("NG") },
  { country: "Norway", code: "+47", flag: getFlag("NO") },
  { country: "Oman", code: "+968", flag: getFlag("OM") },
  { country: "Pakistan", code: "+92", flag: getFlag("PK") },
  { country: "Panama", code: "+507", flag: getFlag("PA") },
  { country: "Papua New Guinea", code: "+675", flag: getFlag("PG") },
  { country: "Paraguay", code: "+595", flag: getFlag("PY") },
  { country: "Peru", code: "+51", flag: getFlag("PE") },
  { country: "Philippines", code: "+63", flag: getFlag("PH") },
  { country: "Poland", code: "+48", flag: getFlag("PL") },
  { country: "Portugal", code: "+351", flag: getFlag("PT") },
  { country: "Qatar", code: "+974", flag: getFlag("QA") },
  { country: "Romania", code: "+40", flag: getFlag("RO") },
  { country: "Russia", code: "+7", flag: getFlag("RU") },
  { country: "Rwanda", code: "+250", flag: getFlag("RW") },
  { country: "Saudi Arabia", code: "+966", flag: getFlag("SA") },
  { country: "Senegal", code: "+221", flag: getFlag("SN") },
  { country: "Serbia", code: "+381", flag: getFlag("RS") },
  { country: "Seychelles", code: "+248", flag: getFlag("SC") },
  { country: "Sierra Leone", code: "+232", flag: getFlag("SL") },
  { country: "Singapore", code: "+65", flag: getFlag("SG") },
  { country: "Slovakia", code: "+421", flag: getFlag("SK") },
  { country: "Slovenia", code: "+386", flag: getFlag("SI") },
  { country: "Somalia", code: "+252", flag: getFlag("SO") },
  { country: "South Africa", code: "+27", flag: getFlag("ZA") },
  { country: "South Korea", code: "+82", flag: getFlag("KR") },
  { country: "Spain", code: "+34", flag: getFlag("ES") },
  { country: "Sri Lanka", code: "+94", flag: getFlag("LK") },
  { country: "Sudan", code: "+249", flag: getFlag("SD") },
  { country: "Sweden", code: "+46", flag: getFlag("SE") },
  { country: "Switzerland", code: "+41", flag: getFlag("CH") },
  { country: "Taiwan", code: "+886", flag: getFlag("TW") },
  { country: "Tanzania", code: "+255", flag: getFlag("TZ") },
  { country: "Thailand", code: "+66", flag: getFlag("TH") },
  { country: "Turkey", code: "+90", flag: getFlag("TR") },
  { country: "Uganda", code: "+256", flag: getFlag("UG") },
  { country: "Ukraine", code: "+380", flag: getFlag("UA") },
  { country: "United Arab Emirates", code: "+971", flag: getFlag("AE") },
  { country: "United Kingdom", code: "+44", flag: getFlag("GB") },
  { country: "United States", code: "+1", flag: getFlag("US") },
  { country: "Uruguay", code: "+598", flag: getFlag("UY") },
  { country: "Uzbekistan", code: "+998", flag: getFlag("UZ") },
  { country: "Venezuela", code: "+58", flag: getFlag("VE") },
  { country: "Vietnam", code: "+84", flag: getFlag("VN") },
  { country: "Zambia", code: "+260", flag: getFlag("ZM") },
  { country: "Zimbabwe", code: "+263", flag: getFlag("ZW") },
];

const suggestedCodes = [
  allCountryCodes.find(c => c.country === "United States"),
  allCountryCodes.find(c => c.country === "Mexico"),
  allCountryCodes.find(c => c.country === "United Kingdom"),
  allCountryCodes.find(c => c.country === "Germany"),
  allCountryCodes.find(c => c.country === "Australia"),
  allCountryCodes.find(c => c.country === "Canada"),
  allCountryCodes.find(c => c.country === "France"),
  allCountryCodes.find(c => c.country === "Italy"),
  allCountryCodes.find(c => c.country === "Spain"),
  allCountryCodes.find(c => c.country === "Netherlands"),
].filter(Boolean);

// --- Grouping Function ---
const groupCountries = (countries) => {
  return countries.reduce((acc, country) => {
    const firstLetter = country.country[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(country);
    return acc;
  }, {});
};

// --- Main Component ---
const CountryCodePickerModal = ({ visible, onSelect, onCancel }) => {
  const [search, setSearch] = useState("");
  const sectionListRef = useRef(null);

  // Define the width of the index bar margin
  const INDEX_BAR_WIDTH = 40;

  const filteredCodes = useMemo(() => {
    if (!search) return allCountryCodes;

    return allCountryCodes.filter(
      (item) =>
        item.country.toLowerCase().includes(search.toLowerCase()) ||
        item.code.includes(search)
    );
  }, [search]);

  const groupedCountries = useMemo(() => {
    return groupCountries(filteredCodes);
  }, [filteredCodes]);

  const sections = useMemo(() => {
    const listSections = search
      ? []
      : [
          {
            title: "Suggested",
            data: suggestedCodes,
          },
        ];

    const alphaSections = Object.keys(groupedCountries)
      .sort()
      .map((key) => ({
        title: key,
        data: groupedCountries[key],
      }));

    return [...listSections, ...alphaSections];
  }, [groupedCountries, search]);

  const indexKeys = useMemo(() => {
    const letters = sections
      .filter(section => section.title.length === 1 && section.data.length > 0)
      .map(section => section.title);

    return ["#", ...letters]; // Add # at top
  }, [sections]);


  const scrollToSection = (key) => {
    if (sectionListRef.current) {

      // Scroll to Suggested section for "#"
      if (key === "#") {
        const suggestedIndex = sections.findIndex(s => s.title === "Suggested");
        if (suggestedIndex !== -1) {
          sectionListRef.current.scrollToLocation({
            sectionIndex: suggestedIndex,
            itemIndex: 0,
            animated: true,
          });
        }
        return;
      }

      // Otherwise scroll to alphabetical section
      const sectionIndex = sections.findIndex(section => section.title === key);
      if (sectionIndex !== -1) {
        sectionListRef.current.scrollToLocation({
          sectionIndex: sectionIndex,
          itemIndex: 0,
          viewOffset: 0,
          animated: true,
        });
      }
    }
  };
  // --- Render Functions ---

  const renderSuggestedItem = ({ item }) => (
    <TouchableOpacity
      style={pickerStyles.item}
      // MODIFIED: Pass object { code, flag } instead of item.code
      onPress={() => onSelect({ code: item.code, flag: item.flag })} 
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Text style={pickerStyles.flag}>{item.flag}</Text>
        <Text style={pickerStyles.countryText}>{item.country}</Text>
      </View>
      <Text style={pickerStyles.codeText}>{item.code}</Text>
    </TouchableOpacity>
  );

  const renderRegularItem = ({ item }) => (
    <TouchableOpacity
      style={pickerStyles.item}
      // MODIFIED: Pass object { code, flag } instead of item.code
      onPress={() => onSelect({ code: item.code, flag: item.flag })}
      activeOpacity={0.7}
    >
      <Text style={pickerStyles.flag}>{item.flag}</Text>
      <Text style={pickerStyles.countryText}>{item.country}</Text>
      <Text style={pickerStyles.codeText}>{item.code}</Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title } }) => {
    if (title === "Suggested" && !search) {
      return (
        <View style={pickerStyles.suggestedHeader}>
          <Text style={pickerStyles.sectionHeaderText}>Suggested</Text>
        </View>
      );
    }
    if (title.length === 1) {
      return (
        <View style={pickerStyles.sectionHeader}>
          <Text style={pickerStyles.sectionHeaderText}>{title}</Text>
        </View>
      );
    }
    return null;
  };

  const renderListHeader = () => (
    <View>
      {/* Use My Current Location Section */}
      <TouchableOpacity
        style={pickerStyles.locationButton}
        onPress={() => alert('Fetching location...')}
      >
        <Ionicons
            name="location-outline"
            size={20}
            color={Colors.textSecondary}
            style={{ marginRight: 8 }}
        />
        <Text style={pickerStyles.locationText}>Use my current location</Text>
      </TouchableOpacity>
    </View>
  );

  // --- Component Structure ---
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={pickerStyles.overlay}>
        <SafeAreaView style={pickerStyles.container}>
          <View style={pickerStyles.header}>
            <Text style={pickerStyles.title}>Country/region</Text>
            <TouchableOpacity onPress={onCancel}>
              <MaterialIcons
                name="close"
                size={24}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Search Bar with Icon */}
          <View style={pickerStyles.searchBarContainer}>
            <Ionicons name="search" size={20} color={Colors.textMuted} />
            <TextInput
              style={pickerStyles.searchBarInput}
              placeholder="Search countries or regions"
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* List Container for relative positioning of the index bar */}
          <View style={{flex: 1}}>
              <SectionList
                ref={sectionListRef}
                sections={sections}
                renderItem={({ item, section }) => {
                    if (section.title === "Suggested") {
                        return renderSuggestedItem({ item });
                    }
                    return renderRegularItem({ item });
                }}
                // renderSectionHeader={renderSectionHeader}
                ListHeaderComponent={!search ? renderListHeader : null}
                keyExtractor={(item) => item.code + item.country}
                showsVerticalScrollIndicator={false}
                stickySectionHeadersEnabled={false}
                // APPLY MARGIN TO CREATE GUTTER
                style={{ marginRight: !search ? INDEX_BAR_WIDTH : 0 }}
              />

              {/* ALPHABETICAL INDEX BAR */}
              {!search && (
                <View style={pickerStyles.indexBar}>
                  {indexKeys.map((key) => (
                    <TouchableOpacity
                      key={key}
                      onPress={() => scrollToSection(key)}
                      hitSlop={{ top: 2, bottom: 2, left: 10, right: 10 }}
                    >
                      <Text style={pickerStyles.indexLetter}>{key}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
          </View>

        </SafeAreaView>
      </View>
    </Modal>
  );
};

// --- Styles ---
const pickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: Colors.cardBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "90%",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    marginBottom: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 44,
    marginBottom: 10,
    borderWidth: 1, 
    borderColor: Colors.border,
  },
  searchBarInput: {
    flex: 1,
    height: 44,
    marginLeft: 8,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  item: {
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  flag: {
    fontSize: 22,
    marginRight: 15,
  },
  codeText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textSecondary,
    marginLeft: 10,
  },
  countryText: {
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
  },
  suggestedHeader: {
    paddingVertical: 10,
  },
  sectionHeader: {
    backgroundColor: Colors.cardBg,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  sectionHeaderText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginTop: 10,
    marginBottom: 5,
  },
  // INDEX BAR STYLES
  indexBar: {
    position: 'absolute',
    right: 0,
    top: 50, // Move it down below the search bar
    bottom: 0,
    width: 25, // Match the margin used in SectionList
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    zIndex: 10,
  },
  indexLetter: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary,
    paddingVertical: 4,
  },
});

export default CountryCodePickerModal;