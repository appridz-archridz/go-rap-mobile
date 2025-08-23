const CLOUD_NAME = "dw6sxsnwf";
const PRESET_NAME = "user-profile-pic-preset";
const FOLDER_NAME = "user-profile-pics"
const CLOUDINARY_BASE_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}`;

export const uploadMedia = async (uri, type = "image/jpeg") => {

  const data = new FormData();
  data.append("file", {
    uri,
    type,
    name: "upload.jpg",
});
    data.append("folder", FOLDER_NAME);
  data.append("upload_preset", PRESET_NAME);

  try {
    const res = await fetch(`${CLOUDINARY_BASE_URL}/upload`, {
      method: "POST",
      body: data,
      headers: {
        "Accept": "application/json",
      },
    });

    const json = await res.json();
    return json;
  } catch (err) {
    return { error: err.message };
  }
};
