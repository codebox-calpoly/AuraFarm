import { useState } from "react";
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  Pressable,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { Audio, Video, ResizeMode } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { tailwindColors, tailwindFonts } from "@/constants/tailwind-colors";
import { isVideoUrl } from "@/lib/media";

export interface ChallengeDetailModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description: string;
  /** Newline-separated guideline lines from the API */
  photoGuidelines?: string;
  points: number;
  timeLeft: string;
  onSubmit: (
    mediaUri: string,
    caption: string,
    meta?: { mimeType?: string },
  ) => void | Promise<boolean | void>;
}

export function ChallengeDetailModal({
  visible,
  onClose,
  title,
  description,
  photoGuidelines,
  points,
  timeLeft,
  onSubmit,
}: ChallengeDetailModalProps) {
  const guidelineLines =
    photoGuidelines
      ?.split("\n")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [isVideoMedia, setIsVideoMedia] = useState(false);
  const [pickedMimeType, setPickedMimeType] = useState<string | undefined>(
    undefined,
  );
  const [caption, setCaption] = useState("");
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset state when modal closes
  const handleClose = () => {
    setShowUploadOptions(false);
    setMediaUri(null);
    setIsVideoMedia(false);
    setPickedMimeType(undefined);
    setCaption("");
    setShowActionSheet(false);
    onClose();
  };

  const handleInitialSubmit = () => {
    setShowUploadOptions(true);
  };

  const pickPhotoOrVideoFromLibrary = async () => {
    const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!lib.granted) {
      alert("Allow photo library access to choose a photo or video.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
      videoMaxDuration: 180,
    });

    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0];
      setMediaUri(a.uri);
      setIsVideoMedia(a.type === "video" || isVideoUrl(a.uri));
      setPickedMimeType(a.mimeType ?? undefined);
      setShowActionSheet(false);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0];
      setMediaUri(a.uri);
      setIsVideoMedia(false);
      setPickedMimeType(a.mimeType ?? undefined);
      setShowActionSheet(false);
    }
  };

  const recordVideo = async () => {
    const cam = await ImagePicker.requestCameraPermissionsAsync();
    if (!cam.granted) {
      alert("Camera access is required to record a video.");
      return;
    }
    const mic = await Audio.requestPermissionsAsync();
    if (!mic.granted) {
      alert("Microphone access is needed to record video with audio.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      videoMaxDuration: 180,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0];
      setMediaUri(a.uri);
      setIsVideoMedia(true);
      setPickedMimeType(a.mimeType ?? undefined);
      setShowActionSheet(false);
    }
  };

  const handlePost = async () => {
    if (!mediaUri) return;
    setSubmitting(true);
    try {
      const result = await onSubmit(mediaUri, caption, {
        mimeType: pickedMimeType,
      });
      if (result !== false) handleClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={!showUploadOptions}
      animationType={showUploadOptions ? "slide" : "fade"}
      onRequestClose={handleClose}
    >
      {!showUploadOptions ?
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Pressable
            style={styles.modalContainer}
            onPress={(e) => e.stopPropagation()}
          >
            <ThemedView style={styles.modalContent}>
              {/* Close button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={tailwindColors["aura-gray-500"]}
                />
              </TouchableOpacity>

              {/* Timer */}
              <View style={styles.timerRow}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={tailwindColors["aura-red"]}
                />
                <ThemedText style={styles.timerText}>{timeLeft}</ThemedText>
              </View>

              {/* Title */}
              <ThemedText type="subtitle" style={styles.title}>
                {title}
              </ThemedText>

              <ScrollView
                style={styles.detailScroll}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                <ThemedText style={styles.description}>{description}</ThemedText>

                {guidelineLines.length > 0 && (
                  <View style={styles.guidelinesBlock}>
                    <ThemedText style={styles.guidelinesHeading}>
                      Submission guidelines
                    </ThemedText>
                    {guidelineLines.map((line, i) => (
                      <View key={i} style={styles.guidelineRow}>
                        <ThemedText style={styles.guidelineBullet}>•</ThemedText>
                        <ThemedText style={styles.guidelineText}>{line}</ThemedText>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>

              {/* Initial Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleInitialSubmit}
              >
                <Ionicons
                  name="camera"
                  size={20}
                  color={tailwindColors["aura-white"]}
                />
                <ThemedText style={styles.submitButtonText}>Submit</ThemedText>
              </TouchableOpacity>

              {/* Points */}
              <ThemedText style={styles.pointsText}>+{points} Aura</ThemedText>
            </ThemedView>
          </Pressable>
        </Pressable>
      : <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={styles.fullScreenContainer}>
            <View style={styles.postContainer}>
              {/* Header */}
              <View style={styles.postHeader}>
                <TouchableOpacity onPress={() => setShowUploadOptions(false)}>
                  <Ionicons
                    name="chevron-back"
                    size={24}
                    color={tailwindColors["aura-black"]}
                  />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                  <ThemedText style={styles.headerTitle}>Your post</ThemedText>
                  <ThemedText style={styles.headerSubtitle}>
                    +{points} points
                  </ThemedText>
                </View>
                <View style={{ width: 24 }} />
              </View>

              {/* Media preview (photo or video) */}
              <TouchableOpacity
                style={styles.imagePlaceholder}
                onPress={() => setShowActionSheet(true)}
                activeOpacity={0.9}
              >
                {mediaUri ?
                  isVideoMedia ?
                    <Video
                      source={{ uri: mediaUri }}
                      style={styles.uploadedImage}
                      useNativeControls
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay={false}
                      isLooping={false}
                    />
                  : <Image
                      source={{ uri: mediaUri }}
                      style={styles.uploadedImage}
                      contentFit="cover"
                    />

                : <View style={styles.placeholderContent}>
                    <Ionicons
                      name="images-outline"
                      size={48}
                      color={tailwindColors["aura-gray-300"]}
                    />
                    <ThemedText style={styles.placeholderText}>
                      Photo or video
                    </ThemedText>
                  </View>
                }
              </TouchableOpacity>

              {mediaUri && (
                <TouchableOpacity
                  style={styles.changePhotoButton}
                  onPress={() => setShowActionSheet(true)}
                >
                  <ThemedText style={styles.changePhotoText}>
                    Change photo or video
                  </ThemedText>
                </TouchableOpacity>
              )}

              {/* Caption Input */}
              <View style={styles.captionContainer}>
                <ThemedText style={styles.inputLabel}>Add a caption</ThemedText>
                <TextInput
                  style={styles.captionInput}
                  placeholder="Start typing..."
                  placeholderTextColor={tailwindColors["aura-gray-400"]}
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                  blurOnSubmit={true}
                />
              </View>

              {/* Post Button */}
              <TouchableOpacity
                style={[
                  styles.postButton,
                  (!mediaUri || submitting) && styles.disabledButton,
                ]} 
                onPress={handlePost}
                disabled={!mediaUri || submitting}
              >
                <ThemedText style={styles.postButtonText}>
                  {submitting ? "Submitting…" : "Post"}
                </ThemedText>
              </TouchableOpacity>

              {!mediaUri && (
                <ThemedText style={styles.warningText}>
                  Add a photo or video to submit
                </ThemedText>
              )}
            </View>

            {/* Action Sheet Overlay */}
            {showActionSheet && (
              <Pressable
                style={styles.actionSheetOverlay}
                onPress={() => setShowActionSheet(false)}
              >
                <View style={styles.actionSheet}>
                  <TouchableOpacity
                    style={styles.actionSheetButton}
                    onPress={pickPhotoOrVideoFromLibrary}
                  >
                    <ThemedText style={styles.actionSheetText}>
                      Photo or video from library
                    </ThemedText>
                  </TouchableOpacity>
                  <View style={styles.separator} />
                  <TouchableOpacity
                    style={styles.actionSheetButton}
                    onPress={takePhoto}
                  >
                    <ThemedText style={styles.actionSheetText}>
                      Take photo
                    </ThemedText>
                  </TouchableOpacity>
                  <View style={styles.separator} />
                  <TouchableOpacity
                    style={styles.actionSheetButton}
                    onPress={recordVideo}
                  >
                    <ThemedText style={styles.actionSheetText}>
                      Record video
                    </ThemedText>
                  </TouchableOpacity>
                  <View style={styles.separator} />
                  <TouchableOpacity
                    style={[styles.actionSheetButton, styles.cancelButton]}
                    onPress={() => setShowActionSheet(false)}
                  >
                    <ThemedText
                      style={[styles.actionSheetText, styles.cancelText]}
                    >
                      Cancel
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </Pressable>
            )}
          </SafeAreaView>
        </TouchableWithoutFeedback>
      }
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: tailwindColors["aura-surface"],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: tailwindColors["aura-border"],
    padding: 24,
    position: "relative",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  timerText: {
    color: tailwindColors["aura-red"],
    fontSize: 14,
    fontFamily: tailwindFonts["regular"],
  },
  title: {
    fontSize: 28,
    fontFamily: tailwindFonts["bold"],
    marginBottom: 16,
    color: tailwindColors["aura-black"],
  },
  detailScroll: {
    maxHeight: 280,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontFamily: tailwindFonts["regular"],
    lineHeight: 24,
    color: tailwindColors["aura-gray-700"],
    marginBottom: 16,
  },
  guidelinesBlock: {
    marginBottom: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: tailwindColors["aura-border"],
  },
  guidelinesHeading: {
    fontSize: 13,
    fontFamily: tailwindFonts["semibold"],
    color: tailwindColors["aura-gray-500"],
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  guidelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  guidelineBullet: {
    fontSize: 16,
    color: tailwindColors["aura-green"],
    lineHeight: 22,
    marginTop: 1,
  },
  guidelineText: {
    flex: 1,
    fontSize: 15,
    fontFamily: tailwindFonts["regular"],
    lineHeight: 22,
    color: tailwindColors["aura-gray-700"],
  },
  submitButton: {
    backgroundColor: tailwindColors["aura-green"],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignSelf: "center",
    marginBottom: 12,
    width: "100%",
  },
  submitButtonText: {
    color: tailwindColors["aura-white"],
    fontSize: 18,
    fontFamily: tailwindFonts["semibold"],
  },
  pointsText: {
    color: tailwindColors["aura-green"],
    fontSize: 18,
    fontFamily: tailwindFonts["semibold"],
    textAlign: "center",
  },
  // New Styles for Post Flow
  fullScreenContainer: {
    flex: 1,
    backgroundColor: tailwindColors["aura-white"],
  },
  postContainer: {
    flex: 1,
    padding: 24,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: tailwindFonts["bold"],
    color: tailwindColors["aura-black"],
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: tailwindFonts["semibold"],
    color: "#FFB800", // Gold color for points
  },
  imagePlaceholder: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: tailwindColors["aura-gray-200"],
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    overflow: "hidden",
  },
  placeholderContent: {
    alignItems: "center",
    gap: 8,
  },
  placeholderText: {
    color: tailwindColors["aura-gray-400"],
    fontFamily: tailwindFonts["semibold"],
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
  },
  changePhotoButton: {
    alignSelf: "center",
    backgroundColor: tailwindColors["aura-red-tint"],
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  changePhotoText: {
    color: tailwindColors["aura-red"],
    fontFamily: tailwindFonts["semibold"],
    fontSize: 12,
  },
  captionContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: tailwindFonts["semibold"],
    color: tailwindColors["aura-black"],
    marginTop: 8,
    marginBottom: 4,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: tailwindColors["aura-gray-200"],
    borderRadius: 8,
    padding: 12,
    fontFamily: tailwindFonts["regular"],
    minHeight: 40,
    textAlignVertical: "top",
  },
  postButton: {
    backgroundColor: tailwindColors["aura-green"],
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  postButtonText: {
    color: tailwindColors["aura-white"],
    fontFamily: tailwindFonts["bold"],
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: tailwindColors["aura-gray-300"],
  },
  warningText: {
    color: tailwindColors["aura-red"],
    fontSize: 10,
    fontFamily: tailwindFonts["semibold"],
    textAlign: "center",
  },
  // Action Sheet Styles
  actionSheetOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
    zIndex: 10,
  },
  actionSheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
    paddingTop: 8,
  },
  actionSheetButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  actionSheetText: {
    color: "#007AFF",
    fontSize: 18,
    fontFamily: tailwindFonts["semibold"],
  },
  separator: {
    height: 1,
    backgroundColor: tailwindColors["aura-gray-100"],
  },
  cancelButton: {
    marginTop: 8,
  },
  cancelText: {
    color: tailwindColors["aura-red"],
    fontWeight: "bold",
  },
});
