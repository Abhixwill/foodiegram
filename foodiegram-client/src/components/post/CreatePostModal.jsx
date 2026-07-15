// Modal used for both creating a new post and editing an existing one.
// Pass `editingPost` to switch into edit mode.

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ImagePlus, Sparkles, Hash, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { createPostApi, updatePostApi } from "../../api/post.api";
import { generateCaptionApi, generateHashtagsApi } from "../../api/ai.api";
import Button from "../common/Button";

const CreatePostModal = ({ open, onClose, onSaved, editingPost }) => {
  const isEditMode = Boolean(editingPost);

  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [aiLoadingCaption, setAiLoadingCaption] = useState(false);
  const [aiLoadingHashtags, setAiLoadingHashtags] = useState(false);
  const aiLoading = aiLoadingCaption || aiLoadingHashtags;

  const handleAiCaption = async () => {
    if (!imageFile && !previewUrl) {
      toast.error("Please upload an image first");
      return;
    }

    setAiLoadingCaption(true);
    try {
      let res;
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        res = await generateCaptionApi(formData);
      } else {
        res = await generateCaptionApi({ imageUrl: previewUrl });
      }

      const suggestions = res.data.captions;
      if (suggestions && suggestions.length > 0) {
        setCaption(suggestions[0]);
        toast.success("AI Caption generated!");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to generate caption");
    } finally {
      setAiLoadingCaption(false);
    }
  };

  const handleAiHashtags = async () => {
    setAiLoadingHashtags(true);
    try {
      let res;
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("caption", caption);
        res = await generateHashtagsApi(formData);
      } else {
        res = await generateHashtagsApi({ caption, imageUrl: previewUrl });
      }

      const tags = res.data.hashtags;
      if (tags && tags.length > 0) {
        const hashtagsString = tags.map((t) => `#${t}`).join(" ");
        setCaption((prev) => (prev ? `${prev}\n\n${hashtagsString}` : hashtagsString));
        toast.success("AI Hashtags added!");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to suggest hashtags");
    } finally {
      setAiLoadingHashtags(false);
    }
  };

  useEffect(() => {
    if (open) {
      setCaption(editingPost?.caption || "");
      setPreviewUrl(editingPost?.imageUrl || "");
      setImageFile(null);
    }
  }, [open, editingPost]);

  if (!open) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditMode && !imageFile) {
      toast.error("Please select a food image");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        const { data } = await updatePostApi(editingPost.id, {
          caption,
          image: imageFile,
        });
        toast.success("Post updated");
        onSaved?.(data.post, "update");
      } else {
        const { data } = await createPostApi({ caption, image: imageFile });
        toast.success("Post shared!");
        onSaved?.(data.post, "create");
      }
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCaption("");
    setImageFile(null);
    setPreviewUrl("");
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-strong rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">
              {isEditMode ? "Edit Post" : "Share a Dish"}
            </h2>
            <button onClick={handleClose} className="btn-icon">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block cursor-pointer">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-2xl"
                />
              ) : (
                <div className="w-full h-64 rounded-2xl border-2 border-dashed border-coral-300 dark:border-white/20 flex flex-col items-center justify-center gap-2 text-coral-400">
                  <ImagePlus className="h-10 w-10" />
                  <span className="text-sm font-medium">Click to upload a photo</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {previewUrl && (
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleAiCaption}
                  disabled={aiLoading}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full glass hover:bg-coral-500/10 text-coral-600 dark:text-amber-200 flex items-center gap-1 transition-all disabled:opacity-50"
                >
                  {aiLoadingCaption ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  AI Caption
                </button>
                <button
                  type="button"
                  onClick={handleAiHashtags}
                  disabled={aiLoading}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full glass hover:bg-coral-500/10 text-coral-600 dark:text-amber-200 flex items-center gap-1 transition-all disabled:opacity-50"
                >
                  {aiLoadingHashtags ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Hash className="h-3.5 w-3.5" />
                  )}
                  AI Hashtags
                </button>
              </div>
            )}

            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption... What made this dish special?"
              rows={3}
              className="input-field resize-none"
            />

            <Button type="submit" loading={submitting} className="w-full">
              {isEditMode ? "Save Changes" : "Share Post"}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreatePostModal;
