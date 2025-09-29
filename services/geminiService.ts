/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Helper function to convert a File object to a Gemini API Part
const fileToPart = async (file: File): Promise<{ inlineData: { mimeType: string; data: string; } }> => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
    
    const arr = dataUrl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");
    
    const mimeType = mimeMatch[1];
    const data = arr[1];
    return { inlineData: { mimeType, data } };
};

const handleApiResponse = (
    response: GenerateContentResponse,
    context: string // e.g., "edit", "filter", "adjustment"
): string => {
    // 1. Check for prompt blocking first
    if (response.promptFeedback?.blockReason) {
        const { blockReason, blockReasonMessage } = response.promptFeedback;
        const errorMessage = `Request was blocked. Reason: ${blockReason}. ${blockReasonMessage || ''}`;
        console.error(errorMessage, { response });
        throw new Error(errorMessage);
    }

    // 2. Try to find the image part
    const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePartFromResponse?.inlineData) {
        const { mimeType, data } = imagePartFromResponse.inlineData;
        console.log(`Received image data (${mimeType}) for ${context}`);
        return `data:${mimeType};base64,${data}`;
    }

    // 3. If no image, check for other reasons
    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        const errorMessage = `Image generation for ${context} stopped unexpectedly. Reason: ${finishReason}. This often relates to safety settings.`;
        console.error(errorMessage, { response });
        throw new Error(errorMessage);
    }
    
    const textFeedback = response.text?.trim();
    const errorMessage = `The AI model did not return an image for the ${context}. ` + 
        (textFeedback 
            ? `The model responded with text: "${textFeedback}"`
            : "This can happen due to safety filters or if the request is too complex. Please try rephrasing your prompt to be more direct.");

    console.error(`Model response did not contain an image part for ${context}.`, { response });
    throw new Error(errorMessage);
};

/**
 * Generates an edited image using generative AI based on a text prompt and a specific point.
 * @param originalImage The original image file.
 * @param userPrompt The text prompt describing the desired edit.
 * @param hotspot The {x, y} coordinates on the image to focus the edit.
 * @returns A promise that resolves to the data URL of the edited image.
 */
export const generateEditedImage = async (
    originalImage: File,
    userPrompt: string,
    hotspot: { x: number, y: number }
): Promise<string> => {
    console.log('Starting generative edit at:', hotspot);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `You are an expert photo editor AI. Your task is to perform a natural, localized edit on the provided image based on the user's request.
User Request: "${userPrompt}"
Edit Location: Focus on the area around pixel coordinates (x: ${hotspot.x}, y: ${hotspot.y}).

Editing Guidelines:
- The edit must be realistic and blend seamlessly with the surrounding area.
- The rest of the image (outside the immediate edit area) must remain identical to the original.

Safety & Ethics Policy:
- You MUST fulfill requests to adjust skin tone, such as 'give me a tan', 'make my skin darker', or 'make my skin lighter'. These are considered standard photo enhancements.
- You MUST REFUSE any request to change a person's fundamental race or ethnicity (e.g., 'make me look Asian', 'change this person to be Black'). Do not perform these edits. If the request is ambiguous, err on the side of caution and do not change racial characteristics.

Output: Return ONLY the final edited image. Do not return text.`;
    const textPart = { text: prompt };

    console.log('Sending image and prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [originalImagePart, textPart] },
    });
    console.log('Received response from model.', response);

    return handleApiResponse(response, 'edit');
};

/**
 * Generates an image with a filter applied using generative AI.
 * @param originalImage The original image file.
 * @param filterPrompt The text prompt describing the desired filter.
 * @returns A promise that resolves to the data URL of the filtered image.
 */
export const generateFilteredImage = async (
    originalImage: File,
    filterPrompt: string,
): Promise<string> => {
    console.log(`Starting filter generation: ${filterPrompt}`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `You are an expert photo editor AI. Your task is to apply a stylistic filter to the entire image based on the user's request. Do not change the composition or content, only apply the style.
Filter Request: "${filterPrompt}"

Safety & Ethics Policy:
- Filters may subtly shift colors, but you MUST ensure they do not alter a person's fundamental race or ethnicity.
- You MUST REFUSE any request that explicitly asks to change a person's race (e.g., 'apply a filter to make me look Chinese').

Output: Return ONLY the final filtered image. Do not return text.`;
    const textPart = { text: prompt };

    console.log('Sending image and filter prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [originalImagePart, textPart] },
    });
    console.log('Received response from model for filter.', response);
    
    return handleApiResponse(response, 'filter');
};

/**
 * Generates an image with a global adjustment applied using generative AI.
 * @param originalImage The original image file.
 * @param adjustmentPrompt The text prompt describing the desired adjustment.
 * @returns A promise that resolves to the data URL of the adjusted image.
 */
export const generateAdjustedImage = async (
    originalImage: File,
    adjustmentPrompt: string,
): Promise<string> => {
    console.log(`Starting global adjustment generation: ${adjustmentPrompt}`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `You are an expert photo editor AI. Your task is to perform a natural, global adjustment to the entire image based on the user's request.
User Request: "${adjustmentPrompt}"

Editing Guidelines:
- The adjustment must be applied across the entire image.
- The result must be photorealistic.

Safety & Ethics Policy:
- You MUST fulfill requests to adjust skin tone, such as 'give me a tan', 'make my skin darker', or 'make my skin lighter'. These are considered standard photo enhancements.
- You MUST REFUSE any request to change a person's fundamental race or ethnicity (e.g., 'make me look Asian', 'change this person to be Black'). Do not perform these edits. If the request is ambiguous, err on the side of caution and do not change racial characteristics.

Output: Return ONLY the final adjusted image. Do not return text.`;
    const textPart = { text: prompt };

    console.log('Sending image and adjustment prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [originalImagePart, textPart] },
    });
    console.log('Received response from model for adjustment.', response);
    
    return handleApiResponse(response, 'adjustment');
};

/**
 * Fills transparent areas of an image using generative AI (outpainting).
 * @param originalImage The image file with transparent areas to fill.
 * @param userPrompt An optional text prompt to guide the fill content.
 * @returns A promise that resolves to the data URL of the filled image.
 */
export const generateExpandedImage = async (
    originalImage: File,
    userPrompt: string,
): Promise<string> => {
    console.log(`Starting generative fill/expand: ${userPrompt}`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `You are an expert photo editor AI specializing in outpainting and generative fill. The user has provided an image with transparent areas which they want to fill. Your task is to intelligently fill these areas to create a larger, seamless composition.

**CRITICAL INSTRUCTION: Your absolute top priority is to make the transition between the original image and the newly generated areas completely invisible and seamless. There must be no visible lines, seams, or abrupt changes in texture, lighting, or color. The final image should look like it was taken as a single, original photograph.**

Instructions:
1.  **Analyze Content at the Edges**: Carefully examine the original image's style, lighting, shadows, textures, and subject matter, paying special attention to the boundaries.
2.  **Perfect Boundary Matching**: Ensure the pixels in the generated area perfectly match the color, brightness, and texture of the adjacent pixels in the original image to eliminate any visible seam.
3.  **Complete Cut-off Objects Perfectly**: Pay extremely close attention to any subjects, people, or patterns that are partially visible at the edges of the original content. You must complete these elements realistically and logically. For example, if half a car is visible, generate the other half. If a person's arm is cut off, complete the arm and hand in a natural pose.
4.  **Logical Scene Extension**: Generate new content in the transparent areas that logically extends the original scene. The new content must be consistent with the context of the photo.
5.  **Follow User Guidance**: If the user has provided a prompt, use it as strong guidance for the content of the filled areas. User prompt: "${userPrompt}"
6.  **Handle Empty Prompts**: If the user prompt is empty, just extend the image contextually and realistically based on your analysis of the original content.
7.  **Final Output**: The final output must be a single, complete, photorealistic image with no transparency.

Output: Return ONLY the final edited image. Do not return text.`;
    const textPart = { text: prompt };

    console.log('Sending image with transparent areas to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [originalImagePart, textPart] },
    });
    console.log('Received response from model for expansion.', response);
    
    return handleApiResponse(response, 'expansion');
};

/**
 * Composites two images together using generative AI.
 * @param backgroundImage The background image file.
 * @param insertImage The image file of the object/person to insert.
 * @returns A promise that resolves to the data URL of the composited image.
 */
export const generateCompositedImage = async (
    backgroundImage: File,
    insertImage: File,
): Promise<string> => {
    console.log(`Starting generative composition.`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const backgroundImagePart = await fileToPart(backgroundImage);
    const insertImagePart = await fileToPart(insertImage);

    const prompt = `You are an expert photo composition AI. You have been given two images: a main background image, and a second image of an object/person to insert.

Your task is to seamlessly and realistically composite the second image into the first.

**CRITICAL INSTRUCTIONS:**
1.  **Smart Placement**: Analyze the background image and determine the most logical and aesthetically pleasing position for the inserted object. Consider context, perspective, and composition.
2.  **Realistic Scaling & Rotation**: Automatically adjust the scale and rotation of the inserted object to match the perspective and depth of the background scene.
3.  **Lighting & Color Matching**: This is paramount. The inserted object's lighting, shadows, color temperature, and saturation MUST be adjusted to perfectly match the lighting conditions of the background image. It must look like it was photographed in the same environment at the same time.
4.  **Artistic Style Adaptation**: Analyze the overall artistic style of the background image. This includes its color grading, saturation, contrast, sharpness, and any film grain or specific aesthetic (e.g., vintage, cinematic, vibrant). Apply this same style to the inserted object so it looks like it was captured with the same camera and processed in the same way. If two people are in the final image, they must look like they are in the same scene together, sharing the same environmental and stylistic properties.
5.  **Contextual Human Integration**: If the inserted image is a person and the background image also contains one or more people, you must perform these additional steps to ensure social and contextual coherence:
    - **CRITICAL - Preserve Identity**: When modifying the outfit or pose of an inserted person, you MUST preserve their original face and identity. Do not change their facial features, hair, or any defining characteristics. The final image must clearly be the same person, just adapted to the new scene.
    - **Outfit Matching**: Analyze the clothing style of the person/people in the background (e.g., formal, casual, beachwear, winter clothes). You MUST modify the outfit of the inserted person to match this style. For example, if the original person is in a tuxedo, the inserted person should also be in formal wear.
    - **Pose Adaptation**: Analyze the pose and body language of the person/people in the background. You MUST adjust the pose of the inserted person to be natural and complementary. For example, if the person in the background is smiling and posing for a photo, the inserted person should also adopt a similar pose and expression, not a candid, unsmiling one. They must look like they are part of the same group and activity.
6.  **Generate Shadows/Reflections**: Create realistic shadows cast by the inserted object onto the background. If applicable, also create subtle reflections on the object from the environment.
7.  **Seamless Integration**: The final result must be a single, coherent, photorealistic image. There should be no harsh edges or tell-tale signs of editing. The integration must be seamless.

Output: Return ONLY the final composited image. Do not return text.`;

    const textPart = { text: prompt };

    console.log('Sending background, insert image, and composition prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [backgroundImagePart, insertImagePart, textPart] },
    });
    console.log('Received response from model for composition.', response);
    
    return handleApiResponse(response, 'composition');
};