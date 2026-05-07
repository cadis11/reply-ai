import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback } from 'react'

export const Route = createFileRoute('/')({
  component: Home,
})

type BusinessType =
  | 'Restaurant' | 'Cafe' | 'Salon' | 'Barbershop' | 'Spa' | 'Clinic'
  | 'Dental' | 'Pharmacy' | 'Retail Store' | 'Boutique' | 'Gym' | 'Hotel'
  | 'Cleaning Service' | 'Plumber' | 'Electrician' | 'Mechanic' | 'Landscaper'
  | 'Pet Grooming' | 'Photographer' | 'Event Venue'
  | 'Spiritual Shop' | 'Wellness Center' | 'E-commerce Store'
  | 'Jewellery Store' | 'Real Estate' | 'Online Boutique' | 'Other'

type Tone = 'Professional' | 'Friendly' | 'Apologetic' | 'Empathetic' | 'Enthusiastic'

function detectReviewType(reviewText: string): 'Positive' | 'Negative' | 'Neutral' {
  const lower = reviewText.toLowerCase()
  const positiveWords = ['love', 'great', 'amazing', 'excellent', 'fantastic', 'wonderful', 'awesome', 'best', 'perfect', 'incredible', 'delicious', 'friendly', 'helpful', 'beautiful', 'recommend', 'impressed', 'outstanding', 'brilliant', 'lovely', 'enjoyed', 'satisfied', 'happy', 'pleased', 'thank', 'thanks', 'appreciate']
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'poor', 'disappointed', 'rude', 'slow', 'cold', 'broken', 'wrong', 'never', 'hate', 'annoyed', 'frustrated', 'unhappy', 'upset', 'problem', 'issue', 'complaint', 'refund', 'complain', 'waste', 'overpriced']
  let posCount = 0, negCount = 0
  for (const w of positiveWords) { if (lower.includes(w)) posCount++ }
  for (const w of negativeWords) { if (lower.includes(w)) negCount++ }
  if (posCount > negCount) return 'Positive'
  if (negCount > posCount) return 'Negative'
  return 'Neutral'
}

const REPLIES: Record<string, Record<'Positive' | 'Negative' | 'Neutral', Record<Tone, string>>> = {
  Restaurant: {
    Positive: {
      Professional: 'Dear Valued Guest, Thank you for your wonderful review. We are delighted to hear that you had an excellent experience at our restaurant. Your satisfaction is our greatest reward, and we look forward to welcoming you back soon. Warm regards, The Restaurant Team',
      Friendly: 'Hi! Thank you so much — we really appreciate you taking the time to share your kind words! Everyone here was so happy to hear you had a great time. We would love to welcome you back soon. See you again!',
      Apologetic: 'Dear Guest, Thank you for your feedback. We are glad you enjoyed your visit, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again, and we look forward to seeing you soon.',
      Empathetic: 'Hi there! Thank you for sharing such a thoughtful review — we are truly grateful for your kind words. It means a lot to our whole team to hear that we made your dining experience special. We look forward to creating more great memories for you soon.',
      Enthusiastic: 'Wow, thank you so much! We are absolutely thrilled to hear you loved your experience! Our entire team is so excited and grateful for your wonderful words. Cannot wait to welcome you back — you made our day!',
    },
    Negative: {
      Professional: 'Dear Guest, Thank you for bringing this to our attention. We sincerely apologize for the experience you had. We take all feedback seriously and have shared this with our team to ensure improvements are made. Please contact us directly so we can discuss this further. Sincerely, Restaurant Management',
      Friendly: 'Hi there, I am truly sorry to hear that your experience was not what you expected. That really is not good enough, and we want to make it right. Please reach out to us directly so we can personally address your concerns. Thank you for giving us the chance to improve.',
      Apologetic: 'Dear Guest, We are deeply sorry that your visit did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right for you.',
      Empathetic: 'Hi there, I can only imagine how disappointing that experience must have been for you, and I am so sorry. Your trust means everything to us, and we are committed to making things right. Please reach out to us directly — we truly want to fix this.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough experience — that is not the kind of visit we want anyone to have! We are on it right away and want to personally make this better for you. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Guest, Thank you for your review. We value your feedback and are continually looking for ways to improve our restaurant experience. We hope to welcome you back soon and exceed your expectations. Best regards, The Restaurant Team',
      Friendly: 'Hi there! Thank you for sharing your feedback — we always appreciate hearing from our guests. We are always working to make every visit better, and your words help us get there. Come back and see us anytime!',
      Apologetic: 'Dear Guest, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving every aspect of your experience. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We understand that every visit is different, and we truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your visit went! We are always fired up to get better and better for you. Cannot wait to see you again and show you what we have been working on!',
    },
  },
  Cafe: {
    Positive: {
      Professional: 'Dear Valued Guest, Thank you for your wonderful review. We are delighted to hear that you had a great experience at our cafe. Your satisfaction is our greatest reward, and we look forward to serving you again soon. Warm regards, The Cafe Team',
      Friendly: 'Hi! Thank you so much — we really appreciate your kind words! Our baristas were so happy to hear you loved your visit. We would love to welcome you back soon for another great cup. ☕',
      Apologetic: 'Dear Guest, Thank you for your positive feedback. We are glad you enjoyed your time with us, and we appreciate your support. We will keep working hard to maintain the quality you expect. Thank you again!',
      Empathetic: 'Hi there! Thank you for sharing such a warm review — we truly appreciate it. It means so much to our whole team to hear that we made your cafe visit special. We look forward to seeing you again soon!',
      Enthusiastic: 'Yay! Thank you so much! We are absolutely thrilled to hear you loved your time at our cafe! Our team is so excited and grateful. Cannot wait to make you your next favorite drink — see you soon! ☕',
    },
    Negative: {
      Professional: 'Dear Guest, Thank you for bringing this to our attention. We sincerely apologize for the experience you had. We take all feedback seriously and have shared this with our team. Please contact us directly so we can discuss this further. Sincerely, Cafe Management',
      Friendly: 'Hi there, I am truly sorry to hear that. That is not the experience we want for any of our guests. Please reach out to us directly so we can personally address your concerns. Thank you for giving us the chance to do better.',
      Apologetic: 'Dear Guest, We are deeply sorry that your visit did not meet your expectations. This is not the standard we hold ourselves to, and we sincerely apologize. We have addressed this with our team. Please contact us so we can make this right.',
      Empathetic: 'Hi there, I can only imagine how disappointing that experience was for you, and I am so sorry. Your trust means everything to us. Please reach out to us directly — we truly want to fix this for you.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough time — that is not okay! We want to personally make this better for you right away. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Guest, Thank you for your review. We value your feedback and are continually looking for ways to improve the cafe experience. We hope to welcome you back soon. Best regards, The Cafe Team',
      Friendly: 'Hi there! Thank you for sharing your feedback — we always appreciate hearing from our guests. We are always working to improve, and your words help us get there. Come back and see us anytime! ☕',
      Apologetic: 'Dear Guest, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your visit went! We are always excited to get better and better for you. Cannot wait to see you again! ☕',
    },
  },
  Salon: {
    Positive: {
      Professional: 'Dear Guest, Thank you for your wonderful review. We are thrilled to hear that you had a fantastic experience at our salon. Our team is committed to providing exceptional service, and your feedback truly motivates us. We look forward to seeing you again. Warm regards, The Salon Team',
      Friendly: 'Hi! Your kind words really made our whole day! We are so happy you loved your visit. Our stylists genuinely enjoy making clients look and feel amazing. Cannot wait to see you again! 💇‍♀️',
      Apologetic: 'Dear Guest, Thank you for your positive feedback. We are glad you enjoyed your visit, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again!',
      Empathetic: 'Hi there! Thank you for sharing such a thoughtful review — we are truly grateful for your kind words. It means a lot to our whole team to hear that we made your salon visit special. We look forward to seeing you again!',
      Enthusiastic: 'Wow, thank you so much! We are absolutely thrilled to hear you loved your experience! Our entire team is so excited and grateful for your wonderful words. Cannot wait to welcome you back — you made our day! 💇‍♀️',
    },
    Negative: {
      Professional: 'Dear Guest, We apologize for the disappointing experience you had at our salon. Your feedback has been shared with our team, and we are taking immediate steps to ensure this does not happen again. Please contact us directly so we can personally address your concerns. Sincerely, Salon Management',
      Friendly: 'Hi there, I am so sorry to hear your visit did not meet your expectations. That is not the experience we want for any of our clients. I would love to talk with you directly and make things right — please reach out. Your trust means everything to us.',
      Apologetic: 'Dear Guest, We are deeply sorry that your visit did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right for you.',
      Empathetic: 'Hi there, I can only imagine how disappointing that experience must have been, and I am so sorry. Your trust means everything to us, and we are committed to making things right. Please reach out to us directly — we truly want to fix this.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough experience — that is not the kind of visit we want anyone to have! We are on it right away and want to personally make this better for you. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Guest, Thank you for your feedback. At our salon, we are committed to continuously improving our services. Your input is invaluable in helping us achieve that goal. We hope to have the opportunity to serve you again in the future. Best regards, Salon Team',
      Friendly: 'Hi there! Thank you for sharing your thoughts — we always love hearing from our clients. We would love to welcome you back and show you the full salon experience. Come back anytime! 💇‍♀️',
      Apologetic: 'Dear Guest, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving every aspect of your experience. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your visit went! We are always fired up to get better and better for you. Cannot wait to see you again! 💇‍♀️',
    },
  },
  Barbershop: {
    Positive: {
      Professional: 'Dear Guest, Thank you for your wonderful review. We are delighted to hear that you had a great experience at our barbershop. Our team is dedicated to providing the best cuts in town, and your support motivates us. We look forward to seeing you again. Warm regards, The Barbershop Team',
      Friendly: 'Hi! Your review made our whole team smile — thank you so much! We are thrilled to hear you had a great experience. Our barbers love what they do, and your kind words mean the world to us. Come back anytime! ✂️',
      Apologetic: 'Dear Guest, Thank you for your positive feedback. We are glad you enjoyed your visit, and we appreciate your support. We will keep working hard to maintain the quality you expect. Thank you again!',
      Empathetic: 'Hi there! Thank you for sharing such a kind review — we truly appreciate it. It means a lot to our whole team to hear that we made your barbershop visit special. We look forward to seeing you again!',
      Enthusiastic: 'Wow, thank you so much! We are absolutely thrilled to hear you loved your experience! Our entire team is so excited and grateful. Cannot wait to welcome you back — you made our day! ✂️',
    },
    Negative: {
      Professional: 'Dear Guest, We apologize for the disappointing experience you had at our barbershop. Your feedback has been shared with our team, and we are taking steps to ensure this does not happen again. Please contact us directly so we can personally address your concerns. Sincerely, Barbershop Management',
      Friendly: 'Hi there, I am truly sorry to hear your experience was not what you expected. That is not the standard we hold ourselves to. I would love to talk with you directly and make things right — please reach out.',
      Apologetic: 'Dear Guest, We are deeply sorry that your visit did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right.',
      Empathetic: 'Hi there, I can only imagine how disappointing that experience must have been, and I am so sorry. Your trust means everything to us. Please reach out to us directly — we truly want to fix this.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough experience — that is not okay! We want to personally make this better for you right away. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Guest, Thank you for your feedback. We are committed to continuously improving our services. Your input is invaluable in helping us achieve that goal. We hope to have the opportunity to serve you again in the future. Best regards, Barbershop Team',
      Friendly: 'Hi there! Thank you for sharing your thoughts — we always love hearing from our clients. We would love to welcome you back and show you the full barbershop experience. Come back anytime!',
      Apologetic: 'Dear Guest, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your visit went! We are always excited to get better for you. Cannot wait to see you again!',
    },
  },
  Spa: {
    Positive: {
      Professional: 'Dear Valued Guest, Thank you for your wonderful review. We are delighted to hear that you had a great experience at our spa. Your satisfaction is our greatest reward, and we look forward to helping you relax again soon. Warm regards, The Spa Team',
      Friendly: 'Hi! Thank you so much — your kind words really made our whole day! We are thrilled to hear you left feeling refreshed and relaxed. Our team will be so happy to see your words! We would love to welcome you back soon. 🌿',
      Apologetic: 'Dear Guest, Thank you for your positive feedback. We are glad you enjoyed your visit, and we appreciate your support. We will keep working hard to maintain the quality you expect. Thank you again!',
      Empathetic: 'Hi there! Thank you for sharing such a warm review — we truly appreciate it. It means so much to our whole team to hear that we made your spa visit special. We look forward to seeing you again!',
      Enthusiastic: 'Wow, thank you so much! We are absolutely thrilled to hear you loved your experience! Our entire team is so excited and grateful. Cannot wait to welcome you back — you made our day! 🌿',
    },
    Negative: {
      Professional: 'Dear Guest, Thank you for bringing this to our attention. We sincerely apologize for any inconvenience you experienced. We take all feedback seriously and are actively working to address your concerns. Please contact us directly so we can discuss this further. Sincerely, Spa Management',
      Friendly: 'Hi there, I am truly sorry to hear your experience was not what you expected. Your feedback means a lot to us — we have shared this with our team so we can do better. Please reach out to us directly so we can make this right.',
      Apologetic: 'Dear Guest, We are deeply sorry that your visit did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right.',
      Empathetic: 'Hi there, I can only imagine how disappointing that experience must have been, and I am so sorry. Your trust means everything to us. Please reach out to us directly — we truly want to fix this.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough experience — that is not okay! We want to personally make this better for you right away. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Guest, Thank you for your review. We value your feedback and are continually looking for ways to improve the spa experience. We hope to welcome you back soon. Best regards, Spa Team',
      Friendly: 'Hi there! Thank you for sharing your feedback — we always appreciate hearing from our guests. We are always working to improve, and your words help us get there. Come back and see us anytime! 🌿',
      Apologetic: 'Dear Guest, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your visit went! We are always excited to get better and better for you. Cannot wait to see you again! 🌿',
    },
  },
  Clinic: {
    Positive: {
      Professional: 'Dear Patient, We are deeply grateful for your positive feedback. It is wonderful to hear that you received the level of care and attention you expected. Our clinical team is committed to maintaining the highest standards, and your words encourage us greatly. Warmest regards, Clinic Team',
      Friendly: 'Hi there! Thank you — that review honestly made our whole team smile. We are so glad you had a great experience. Our goal is always to make patients feel comfortable and cared for. We would love to have you back! 🤍',
      Apologetic: 'Dear Patient, Thank you for your positive feedback. We are glad you felt well cared for, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again!',
      Empathetic: 'Hi there! Thank you for sharing such a thoughtful review — we truly appreciate it. It means so much to our whole team to hear that we made your clinic visit a positive experience. We look forward to seeing you again!',
      Enthusiastic: 'Wow, thank you so much! We are absolutely thrilled to hear you loved your experience! Our entire team is so excited and grateful. Cannot wait to welcome you back — you made our day! 🤍',
    },
    Negative: {
      Professional: 'Dear Patient, We sincerely apologize for any distress you experienced during your visit. Patient care is our top priority, and we take this matter very seriously. Please contact our office directly so we can discuss your concerns and work toward a resolution. Sincerely, Clinic Management',
      Friendly: 'Hi there, I am truly sorry to hear your experience was not what it should have been. That deeply matters to us, and we have already shared your feedback with our clinical team. Please reach out to us directly so we can personally address your concerns.',
      Apologetic: 'Dear Patient, We are deeply sorry that your visit did not meet your expectations. This is not the standard of care we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right for you.',
      Empathetic: 'Hi there, I can only imagine how distressing that experience must have been for you, and I am so sorry. Your trust means everything to us. Please reach out to us directly — we truly want to make this right.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough experience — that is not okay! We want to personally make this better for you right away. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Patient, Thank you for your review. We are continually seeking to enhance our patient experience. Your feedback helps us identify areas for improvement. We hope to have the opportunity to provide you with an even better experience in the future. Kind regards, Clinic Team',
      Friendly: 'Hi there! Thank you for taking the time to share your feedback. We truly value every patient perspective. If there is anything we can do better, please do not hesitate to reach out. We are always here for you! 🤍',
      Apologetic: 'Dear Patient, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving every aspect of your experience. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your visit went! We are always excited to get better and better for you. Cannot wait to see you again! 🤍',
    },
  },
  Dental: {
    Positive: {
      Professional: 'Dear Patient, Thank you for your wonderful review. We are delighted to hear that you had a great experience at our dental practice. Your satisfaction is our greatest reward, and we look forward to seeing you at your next visit. Warm regards, The Dental Team',
      Friendly: 'Hi! Thank you so much — we really appreciate you taking the time to share your experience. We are thrilled to hear you had a great visit. Our team will be so happy to see your kind words! See you at your next appointment. 😁',
      Apologetic: 'Dear Patient, Thank you for your positive feedback. We are glad you felt well cared for, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again!',
      Empathetic: 'Hi there! Thank you for sharing such a thoughtful review — we truly appreciate it. It means so much to our whole team to hear that we made your dental visit a positive experience. We look forward to seeing you again!',
      Enthusiastic: 'Wow, thank you so much! We are absolutely thrilled to hear you loved your experience! Our entire team is so excited and grateful. Cannot wait to see you at your next appointment — you made our day! 😁',
    },
    Negative: {
      Professional: 'Dear Patient, We sincerely apologize for any inconvenience or distress you experienced. Patient care is our top priority, and we take this matter very seriously. Please contact us directly so we can discuss your concerns and work toward a resolution. Sincerely, Dental Management',
      Friendly: 'Hi there, I am truly sorry to hear your experience was not what you expected. That is not the standard of care we strive for. I would love to talk with you directly and make things right — please reach out.',
      Apologetic: 'Dear Patient, We are deeply sorry that your visit did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right.',
      Empathetic: 'Hi there, I can only imagine how distressing that experience must have been, and I am so sorry. Your trust means everything to us. Please reach out to us directly — we truly want to make this right.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough experience — that is not okay! We want to personally make this better for you right away. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Patient, Thank you for your review. We are continually seeking to enhance our patient experience. Your feedback helps us identify areas for improvement. We hope to have the opportunity to provide you with an even better experience in the future. Kind regards, Dental Team',
      Friendly: 'Hi there! Thank you for taking the time to share your feedback. We truly value every patient perspective. If there is anything we can do better, please do not hesitate to reach out. We are always here for you!',
      Apologetic: 'Dear Patient, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your visit went! We are always excited to get better and better for you. Cannot wait to see you again!',
    },
  },
  Pharmacy: {
    Positive: {
      Professional: 'Dear Valued Customer, Thank you for your wonderful feedback. We are delighted to hear that you had a great experience at our pharmacy. Your satisfaction is our greatest reward, and we look forward to serving you again soon. Warm regards, The Pharmacy Team',
      Friendly: 'Hi! Thank you so much — we really appreciate you taking the time to share your experience. We are thrilled to hear you had a great visit. Our pharmacists are always here to help. We would love to welcome you back soon! 💊',
      Apologetic: 'Dear Customer, Thank you for your positive feedback. We are glad you enjoyed your visit, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again!',
      Empathetic: 'Hi there! Thank you for sharing such a kind review — we truly appreciate it. It means so much to our whole team to hear that we made your pharmacy visit a positive experience. We look forward to seeing you again!',
      Enthusiastic: 'Wow, thank you so much! We are absolutely thrilled to hear you loved your experience! Our entire team is so excited and grateful. Cannot wait to welcome you back — you made our day! 💊',
    },
    Negative: {
      Professional: 'Dear Customer, We sincerely apologize for any inconvenience you experienced. We take all feedback seriously and are actively working to address your concerns. Please contact us directly so we can discuss this further. Sincerely, Pharmacy Management',
      Friendly: 'Hi there, I am truly sorry to hear your experience was not what you expected. Your feedback means a lot to us — we have shared this with our team so we can do better. Please reach out to us directly so we can make this right.',
      Apologetic: 'Dear Customer, We are deeply sorry that your visit did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right.',
      Empathetic: 'Hi there, I can only imagine how disappointing that experience must have been, and I am so sorry. Your trust means everything to us. Please reach out to us directly — we truly want to fix this.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough experience — that is not okay! We want to personally make this better for you right away. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Customer, Thank you for your review. We value your feedback and are continually looking for ways to improve. We hope to welcome you back soon. Best regards, Pharmacy Team',
      Friendly: 'Hi there! Thank you for sharing your feedback — we always appreciate hearing from our customers. We are always working to improve. Come back anytime! 💊',
      Apologetic: 'Dear Customer, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your visit went! We are always excited to get better and better for you. Cannot wait to see you again! 💊',
    },
  },
  'Retail Store': {
    Positive: {
      Professional: 'Dear Customer, Thank you for your wonderful feedback. We are delighted to hear that you had a positive shopping experience. Our team is dedicated to helping customers find exactly what they need, and your kind words mean a great deal to us. We look forward to seeing you again soon. Warm regards, The Retail Team',
      Friendly: 'Hi! Your review literally made our week — thank you so much! We love hearing that you had a great experience. Finding the right product is what we are all about, and we are so happy we could help. Come back anytime! 🛍️',
      Apologetic: 'Dear Customer, Thank you for your positive feedback. We are glad you found what you needed, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again!',
      Empathetic: 'Hi there! Thank you for sharing such a kind review — we truly appreciate it. It means so much to our whole team to hear that we made your shopping experience a positive one. We look forward to seeing you again!',
      Enthusiastic: 'Wow, thank you so much! We are absolutely thrilled to hear you loved your experience! Our entire team is so excited and grateful. Cannot wait to welcome you back — you made our day! 🛍️',
    },
    Negative: {
      Professional: 'Dear Customer, We sincerely apologize for the unsatisfactory experience you had. We take customer feedback very seriously and are actively reviewing our processes to ensure improvement. Please contact us directly so we can address your concerns personally. Sincerely, Retail Management',
      Friendly: 'Hi there, I am so sorry to hear that — that is not the experience we want for any shopper. We have shared your feedback with our team so we can do better. Please reach out to us directly so we can make this right. We genuinely value your business!',
      Apologetic: 'Dear Customer, We are deeply sorry that your visit did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right.',
      Empathetic: 'Hi there, I can only imagine how disappointing that experience must have been, and I am so sorry. Your trust means everything to us. Please reach out to us directly — we truly want to fix this.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough experience — that is not okay! We want to personally make this better for you right away. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Customer, Thank you for your review. We value all customer feedback as it helps us grow and improve. We are committed to providing a great shopping experience. We hope to welcome you back soon. Best regards, Retail Team',
      Friendly: 'Hi there! Thank you for sharing your experience! We really appreciate you taking the time to tell us about your visit. We are always working to make our store better, and your feedback helps us get there. Come back anytime! 🛍️',
      Apologetic: 'Dear Customer, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your visit went! We are always excited to get better and better for you. Cannot wait to see you again! 🛍️',
    },
  },
  Boutique: {
    Positive: {
      Professional: 'Dear Valued Customer, Thank you for your wonderful feedback. We are delighted to hear that you had a great shopping experience at our boutique. Your support means the world to us, and we look forward to seeing you again soon. Warm regards, The Boutique Team',
      Friendly: 'Hi! Your review made our whole day — thank you so much! We love hearing that you found exactly what you were looking for. Our team curates each piece with care, and we are so happy you loved it. Come back anytime! 👗',
      Apologetic: 'Dear Customer, Thank you for your positive feedback. We are glad you found something you love, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again!',
      Empathetic: 'Hi there! Thank you for sharing such a kind review — we truly appreciate it. It means so much to our whole team to hear that we made your boutique experience special. We look forward to seeing you again!',
      Enthusiastic: 'Wow, thank you so much! We are absolutely thrilled to hear you loved your experience! Our entire team is so excited and grateful. Cannot wait to welcome you back — you made our day! 👗',
    },
    Negative: {
      Professional: 'Dear Customer, We apologize for the disappointing experience you had at our boutique. Your feedback is extremely important to us. Please contact us directly so we can address your concerns personally. Sincerely, Boutique Management',
      Friendly: 'Hi there, I am truly sorry to hear your experience was not what you expected. That is not the experience we want for any shopper. Please reach out to us directly so we can make this right. We value your trust.',
      Apologetic: 'Dear Customer, We are deeply sorry that your visit did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right.',
      Empathetic: 'Hi there, I can only imagine how disappointing that experience must have been, and I am so sorry. Your trust means everything to us. Please reach out to us directly — we truly want to fix this.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough experience — that is not okay! We want to personally make this better for you right away. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Customer, Thank you for your review. We value your feedback and are committed to improving. We hope to welcome you back soon. Best regards, Boutique Team',
      Friendly: 'Hi there! Thank you for sharing your thoughts — we really appreciate your feedback. We are always working to make our boutique better. Come back anytime — we would love to see you! 👗',
      Apologetic: 'Dear Customer, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your visit went! We are always excited to get better and better for you. Cannot wait to see you again! 👗',
    },
  },
  Gym: {
    Positive: {
      Professional: 'Dear Member, Thank you for your positive feedback. We are delighted to hear that you had a great experience at our gym. Your satisfaction is our greatest reward, and we look forward to helping you reach your fitness goals. Warm regards, The Gym Team',
      Friendly: 'Hi! Thank you so much — we really appreciate you taking the time to share your experience. We are thrilled to hear you are loving your workouts with us. Our trainers and staff will be so happy to see your kind words! Keep crushing it! 💪',
      Apologetic: 'Dear Member, Thank you for your positive feedback. We are glad you are enjoying your workouts, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again!',
      Empathetic: 'Hi there! Thank you for sharing such a kind review — we truly appreciate it. It means so much to our whole team to hear that we made your gym experience a positive one. Keep pushing toward your goals! 💪',
      Enthusiastic: 'Wow, thank you so much! We are absolutely thrilled to hear you loved your experience! Our entire team is so excited and grateful. Keep up the amazing work — you are inspiring us all! 💪',
    },
    Negative: {
      Professional: 'Dear Member, We sincerely apologize for any inconvenience you experienced. We take all feedback seriously and are actively working to address your concerns. Please contact us directly so we can discuss this further. Sincerely, Gym Management',
      Friendly: 'Hi there, I am truly sorry to hear your experience was not what you expected. Your feedback means a lot to us — we have shared this with our team so we can do better. Please reach out to us directly so we can make this right.',
      Apologetic: 'Dear Member, We are deeply sorry that your visit did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right.',
      Empathetic: 'Hi there, I can only imagine how disappointing that experience must have been, and I am so sorry. Your trust means everything to us. Please reach out to us directly — we truly want to make this right.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough experience — that is not okay! We want to personally make this better for you right away. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Member, Thank you for your review. We value your feedback and are continually looking for ways to improve the gym experience. We hope to see you crushing your goals soon. Best regards, Gym Team',
      Friendly: 'Hi there! Thank you for your feedback — we always appreciate hearing from our members. We are always looking to improve, and your input helps us get better every day. Keep pushing toward your goals! 💪',
      Apologetic: 'Dear Member, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your visit went! We are always excited to get better and better for you. Cannot wait to see you crushing those goals! 💪',
    },
  },
  Hotel: {
    Positive: {
      Professional: 'Dear Valued Guest, Thank you for your positive feedback. We are delighted to hear that you had a wonderful experience at our hotel. Your satisfaction is our greatest reward, and we look forward to welcoming you back soon. Warm regards, The Hotel Team',
      Friendly: 'Hi! Thank you so much — we really appreciate you taking the time to share your experience. We are thrilled to hear you had a fantastic stay. Our team will be so happy to see your kind words! We would love to welcome you back soon. 🏨',
      Apologetic: 'Dear Guest, Thank you for your positive feedback. We are glad you enjoyed your stay, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again!',
      Empathetic: 'Hi there! Thank you for sharing such a kind review — we truly appreciate it. It means so much to our whole team to hear that we made your hotel stay special. We look forward to welcoming you back soon!',
      Enthusiastic: 'Wow, thank you so much! We are absolutely thrilled to hear you loved your stay! Our entire team is so excited and grateful. Cannot wait to welcome you back — you made our day! 🏨',
    },
    Negative: {
      Professional: 'Dear Guest, We sincerely apologize for any inconvenience you experienced during your stay. We take all feedback seriously and are actively working to address your concerns. Please contact us directly so we can discuss this further. Sincerely, Hotel Management',
      Friendly: 'Hi there, I am truly sorry to hear your stay was not what you expected. Your feedback means a lot to us — we have shared this with our team so we can do better. We would love a chance to make it right. Please reach out to us directly.',
      Apologetic: 'Dear Guest, We are deeply sorry that your stay did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right.',
      Empathetic: 'Hi there, I can only imagine how disappointing that experience must have been, and I am so sorry. Your trust means everything to us. Please reach out to us directly — we truly want to make this right.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough stay — that is not okay! We want to personally make this better for you right away. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Guest, Thank you for your review. We value your feedback and are continually looking for ways to improve the hotel experience. We hope to welcome you back soon. Best regards, Hotel Team',
      Friendly: 'Hi there! Thank you for your feedback — we always appreciate hearing from our guests. We are always looking to improve, and your input helps us get better every day. We would love to welcome you back soon! 🏨',
      Apologetic: 'Dear Guest, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your stay went! We are always excited to get better and better for you. Cannot wait to see you again! 🏨',
    },
  },
  'Cleaning Service': {
    Positive: {
      Professional: 'Dear Valued Customer, Thank you for your positive feedback. We are delighted to hear that you had a wonderful experience with our cleaning service. Your satisfaction is our greatest reward, and we look forward to helping you keep your space spotless soon. Warm regards, The Cleaning Service Team',
      Friendly: 'Hi! Thank you so much — we really appreciate you taking the time to share your experience. We are thrilled to hear you loved the cleaning. Our team takes so much pride in their work, and your kind words mean the world to us! We would love to help again soon. 🧹',
      Apologetic: 'Dear Customer, Thank you for your positive feedback. We are glad you loved the cleaning, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again!',
      Empathetic: 'Hi there! Thank you for sharing such a kind review — we truly appreciate it. It means so much to our whole team to hear that we made your home sparkle. We look forward to helping you again soon! 🧹',
      Enthusiastic: 'Wow, thank you so much! We are absolutely thrilled to hear you loved the cleaning! Our entire team is so excited and grateful. Cannot wait to help you again — you made our day! 🧹',
    },
    Negative: {
      Professional: 'Dear Customer, We sincerely apologize for any inconvenience you experienced. We take all feedback seriously and are actively working to address your concerns. Please contact us directly so we can discuss this further. Sincerely, Cleaning Service Management',
      Friendly: 'Hi there, I am truly sorry to hear your experience was not what you expected. Your feedback means a lot to us — we have shared this with our team so we can do better. Please reach out to us directly so we can make this right.',
      Apologetic: 'Dear Customer, We are deeply sorry that your visit did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right.',
      Empathetic: 'Hi there, I can only imagine how disappointing that experience must have been, and I am so sorry. Your trust means everything to us. Please reach out to us directly — we truly want to make this right.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough experience — that is not okay! We want to personally make this better for you right away. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Customer, Thank you for your review. We value your feedback and are continually looking for ways to improve. We hope to welcome you back soon. Best regards, Cleaning Service Team',
      Friendly: 'Hi there! Thank you for your feedback — we always appreciate hearing from our customers. We are always looking to improve, and your input helps us get better every day. We would love to help again soon! 🧹',
      Apologetic: 'Dear Customer, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your visit went! We are always excited to get better and better for you. Cannot wait to help you again! 🧹',
    },
  },
  Plumber: {
    Positive: {
      Professional: 'Dear Valued Customer, Thank you for your positive feedback. We are delighted to hear that you had a great experience with our plumbing service. Your satisfaction is our greatest reward, and we look forward to helping you with any future plumbing needs. Warm regards, The Plumbing Team',
      Friendly: 'Hi! Thank you so much — we really appreciate you taking the time to share your experience. We are thrilled to hear the job was done right and you were happy with the service. Our team will be so happy to see your kind words! We would love to help with any future plumbing needs. 🔧',
      Apologetic: 'Dear Customer, Thank you for your positive feedback. We are glad the job was done right, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again!',
      Empathetic: 'Hi there! Thank you for sharing such a kind review — we truly appreciate it. It means so much to our whole team to hear that we fixed things just right for you. We look forward to helping you again! 🔧',
      Enthusiastic: 'Wow, thank you so much! We are absolutely thrilled to hear you loved your experience! Our entire team is so excited and grateful. Got another plumbing need? We are just a call away! 🔧',
    },
    Negative: {
      Professional: 'Dear Customer, We sincerely apologize for any inconvenience you experienced. We take all feedback seriously and are actively working to address your concerns. Please contact us directly so we can discuss this further. Sincerely, Plumbing Management',
      Friendly: 'Hi there, I am truly sorry to hear your experience was not what you expected. Your feedback means a lot to us — we have shared this with our team so we can do better. Please reach out to us directly so we can make this right.',
      Apologetic: 'Dear Customer, We are deeply sorry that your experience did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right.',
      Empathetic: 'Hi there, I can only imagine how frustrating that experience must have been, and I am so sorry. Your trust means everything to us. Please reach out to us directly — we truly want to make this right.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough experience — that is not okay! We want to personally make this better for you right away. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Customer, Thank you for your review. We value your feedback and are continually looking for ways to improve. We hope to help you with any future plumbing needs. Best regards, Plumbing Team',
      Friendly: 'Hi there! Thank you for your feedback — we always appreciate hearing from our customers. We are always looking to improve, and your input helps us serve you better. We would love to help with any future plumbing needs. 🔧',
      Apologetic: 'Dear Customer, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your visit went! We are always excited to get better and better for you. Cannot wait to help you again! 🔧',
    },
  },
  Electrician: {
    Positive: {
      Professional: 'Dear Valued Customer, Thank you for your positive feedback. We are delighted to hear that you had a great experience with our electrical service. Your satisfaction is our greatest reward, and we look forward to helping you with any future electrical needs. Warm regards, The Electrical Team',
      Friendly: 'Hi! Thank you so much — we really appreciate you taking the time to share your experience. We are thrilled to hear everything was fixed safely and professionally. Our team will be so happy to see your kind words! We would love to help with any future electrical needs. ⚡',
      Apologetic: 'Dear Customer, Thank you for your positive feedback. We are glad everything was fixed right, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again!',
      Empathetic: 'Hi there! Thank you for sharing such a kind review — we truly appreciate it. It means so much to our whole team to hear that we got your electrical work done right. We look forward to helping you again! ⚡',
      Enthusiastic: 'Wow, thank you so much! We are absolutely thrilled to hear you loved your experience! Our entire team is so excited and grateful. Got another electrical need? We are just a call away! ⚡',
    },
    Negative: {
      Professional: 'Dear Customer, We sincerely apologize for any inconvenience you experienced. We take all feedback seriously and are actively working to address your concerns. Please contact us directly so we can discuss this further. Sincerely, Electrical Management',
      Friendly: 'Hi there, I am truly sorry to hear your experience was not what you expected. Your feedback means a lot to us — we have shared this with our team so we can do better. Please reach out to us directly so we can make this right.',
      Apologetic: 'Dear Customer, We are deeply sorry that your experience did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right.',
      Empathetic: 'Hi there, I can only imagine how frustrating that experience must have been, and I am so sorry. Your trust means everything to us. Please reach out to us directly — we truly want to make this right.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough experience — that is not okay! We want to personally make this better for you right away. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Customer, Thank you for your review. We value your feedback and are continually looking for ways to improve. We hope to help you with any future electrical needs. Best regards, Electrical Team',
      Friendly: 'Hi there! Thank you for your feedback — we always appreciate hearing from our customers. We are always looking to improve, and your input helps us serve you better. We would love to help with any future electrical needs. ⚡',
      Apologetic: 'Dear Customer, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your visit went! We are always excited to get better and better for you. Cannot wait to help you again! ⚡',
    },
  },
  Mechanic: {
    Positive: {
      Professional: 'Dear Valued Customer, Thank you for your positive feedback. We are delighted to hear that you had a great experience with our automotive service. Your satisfaction is our greatest reward, and we look forward to helping you with any future auto needs. Warm regards, The Mechanic Team',
      Friendly: 'Hi! Thank you so much — we really appreciate you taking the time to share your experience. We are thrilled to hear your vehicle is running smoothly again. Our mechanics take so much pride in their work, and your kind words mean the world to us! We would love to help with any future auto needs. 🔧',
      Apologetic: 'Dear Customer, Thank you for your positive feedback. We are glad your vehicle is running smoothly, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again!',
      Empathetic: 'Hi there! Thank you for sharing such a kind review — we truly appreciate it. It means so much to our whole team to hear that we got your vehicle back in top shape. We look forward to helping you again! 🔧',
      Enthusiastic: 'Wow, thank you so much! We are absolutely thrilled to hear you loved your experience! Our entire team is so excited and grateful. Got another car need? We are just a call away! 🔧',
    },
    Negative: {
      Professional: 'Dear Customer, We sincerely apologize for any inconvenience you experienced. We take all feedback seriously and are actively working to address your concerns. Please contact us directly so we can discuss this further. Sincerely, Automotive Management',
      Friendly: 'Hi there, I am truly sorry to hear your experience was not what you expected. Your feedback means a lot to us — we have shared this with our team so we can do better. Please reach out to us directly so we can make this right.',
      Apologetic: 'Dear Customer, We are deeply sorry that your experience did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right.',
      Empathetic: 'Hi there, I can only imagine how frustrating that experience must have been, and I am so sorry. Your trust means everything to us. Please reach out to us directly — we truly want to make this right.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough experience — that is not okay! We want to personally make this better for you right away. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Customer, Thank you for your review. We value your feedback and are continually looking for ways to improve. We hope to help you with any future auto needs. Best regards, Mechanic Team',
      Friendly: 'Hi there! Thank you for your feedback — we always appreciate hearing from our customers. We are always looking to improve, and your input helps us serve you better. We would love to help with any future auto needs. 🔧',
      Apologetic: 'Dear Customer, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your visit went! We are always excited to get better and better for you. Cannot wait to help you again! 🔧',
    },
  },
  Landscaper: {
    Positive: {
      Professional: 'Dear Valued Customer, Thank you for your positive feedback. We are delighted to hear that you had a great experience with our landscaping service. Your satisfaction is our greatest reward, and we look forward to helping you maintain a beautiful yard. Warm regards, The Landscaping Team',
      Friendly: 'Hi! Thank you so much — we really appreciate you taking the time to share your experience. We are thrilled to hear your yard looks amazing. Our team puts so much care into every lawn, and your kind words mean the world to us! We would love to help with any future landscaping needs. 🌿',
      Apologetic: 'Dear Customer, Thank you for your positive feedback. We are glad you loved your yard, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again!',
      Empathetic: 'Hi there! Thank you for sharing such a kind review — we truly appreciate it. It means so much to our whole team to hear that we made your outdoor space beautiful. We look forward to helping you again! 🌿',
      Enthusiastic: 'Wow, thank you so much! We are absolutely thrilled to hear you loved your experience! Our entire team is so excited and grateful. Got another landscaping need? We are just a call away! 🌿',
    },
    Negative: {
      Professional: 'Dear Customer, We sincerely apologize for any inconvenience you experienced. We take all feedback seriously and are actively working to address your concerns. Please contact us directly so we can discuss this further. Sincerely, Landscaping Management',
      Friendly: 'Hi there, I am truly sorry to hear your experience was not what you expected. Your feedback means a lot to us — we have shared this with our team so we can do better. Please reach out to us directly so we can make this right.',
      Apologetic: 'Dear Customer, We are deeply sorry that your experience did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right.',
      Empathetic: 'Hi there, I can only imagine how disappointing that experience must have been, and I am so sorry. Your trust means everything to us. Please reach out to us directly — we truly want to make this right.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough experience — that is not okay! We want to personally make this better for you right away. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Customer, Thank you for your review. We value your feedback and are continually looking for ways to improve. We hope to help you with any future landscaping needs. Best regards, Landscaping Team',
      Friendly: 'Hi there! Thank you for your feedback — we always appreciate hearing from our customers. We are always looking to improve, and your input helps us serve you better. We would love to help with any future landscaping needs. 🌿',
      Apologetic: 'Dear Customer, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your visit went! We are always excited to get better and better for you. Cannot wait to help you again! 🌿',
    },
  },
  'Pet Grooming': {
    Positive: {
      Professional: 'Dear Valued Pet Parent, Thank you for your positive feedback. We are delighted to hear that you and your pet had a great experience at our grooming salon. Your satisfaction is our greatest reward, and we look forward to seeing your furry friend again soon. Warm regards, The Pet Grooming Team',
      Friendly: 'Hi! Thank you so much — we really appreciate you taking the time to share your experience. We are thrilled to hear your furry friend looked adorable! Our groomers love what they do, and your kind words mean the world to us! We would love to pamper your pet again soon. 🐕',
      Apologetic: 'Dear Pet Parent, Thank you for your positive feedback. We are glad your pet looked adorable, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again!',
      Empathetic: 'Hi there! Thank you for sharing such a kind review — we truly appreciate it. It means so much to our whole team to hear that we made your furry friend look and feel great. We look forward to seeing you again! 🐕',
      Enthusiastic: 'Wow, thank you so much! We are absolutely thrilled to hear you and your pet loved the experience! Our entire team is so excited and grateful. Cannot wait to pamper your pet again — you made our day! 🐕',
    },
    Negative: {
      Professional: 'Dear Pet Parent, We sincerely apologize for any inconvenience you experienced. We take all feedback seriously and are actively working to address your concerns. Please contact us directly so we can discuss this further. Sincerely, Pet Grooming Management',
      Friendly: 'Hi there, I am truly sorry to hear your experience was not what you expected. Your feedback means a lot to us — we have shared this with our team so we can do better. Please reach out to us directly so we can make this right. We treat every pet like our own.',
      Apologetic: 'Dear Pet Parent, We are deeply sorry that your experience did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right.',
      Empathetic: 'Hi there, I can only imagine how disappointing that experience must have been for you and your pet, and I am so sorry. Your trust means everything to us. Please reach out to us directly — we truly want to make this right.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough experience — that is not okay! We want to personally make this better for you and your pet right away. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Pet Parent, Thank you for your review. We value your feedback and are continually looking for ways to improve. We hope to see your furry friend again soon. Best regards, Pet Grooming Team',
      Friendly: 'Hi there! Thank you for your feedback — we always appreciate hearing from pet parents. We are always looking to improve, and your input helps us give every pet the best experience. We would love to pamper your furry friend again soon! 🐩',
      Apologetic: 'Dear Pet Parent, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your visit went! We are always excited to get better and better for your pet. Cannot wait to see you again! 🐩',
    },
  },
  Photographer: {
    Positive: {
      Professional: 'Dear Valued Client, Thank you for your positive feedback. We are delighted to hear that you had a wonderful experience with our photography service. Your satisfaction is our greatest reward, and we look forward to capturing more special moments with you soon. Warm regards, The Photography Team',
      Friendly: 'Hi! Thank you so much — we really appreciate you taking the time to share your experience. We are thrilled to hear you loved your photos! Capturing special moments is what we live for, and your kind words mean the world to us. We would love to work with you again soon. 📸',
      Apologetic: 'Dear Client, Thank you for your positive feedback. We are glad you loved your photos, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again!',
      Empathetic: 'Hi there! Thank you for sharing such a kind review — we truly appreciate it. It means so much to our whole team to hear that we captured your special moments just right. We look forward to working with you again! 📸',
      Enthusiastic: 'Wow, thank you so much! We are absolutely thrilled to hear you loved your experience! Our entire team is so excited and grateful. Got a session coming up? We would love to work with you again! 📸',
    },
    Negative: {
      Professional: 'Dear Client, We sincerely apologize for any inconvenience you experienced. We take all feedback seriously and are actively working to address your concerns. Please contact us directly so we can discuss this further. Sincerely, Photography Management',
      Friendly: 'Hi there, I am truly sorry to hear your experience was not what you expected. Your feedback means a lot to us — we have shared this with our team so we can do better. Please reach out to us directly so we can make this right.',
      Apologetic: 'Dear Client, We are deeply sorry that your experience did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right.',
      Empathetic: 'Hi there, I can only imagine how disappointing that experience must have been, and I am so sorry. Your trust means everything to us. Please reach out to us directly — we truly want to make this right.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough experience — that is not okay! We want to personally make this better for you right away. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Client, Thank you for your review. We value your feedback and are continually looking for ways to improve. We hope to work with you again soon. Best regards, Photography Team',
      Friendly: 'Hi there! Thank you for your feedback — we always appreciate hearing from our clients. We are always looking to improve, and your input helps us serve you better. We would love to work with you again soon! 📸',
      Apologetic: 'Dear Client, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your visit went! We are always excited to get better and better for you. Cannot wait to work with you again! 📸',
    },
  },
  'Event Venue': {
    Positive: {
      Professional: 'Dear Valued Host, Thank you for your positive feedback. We are delighted to hear that you had a wonderful experience at our event venue. Your satisfaction is our greatest reward, and we look forward to hosting your next event soon. Warm regards, The Venue Team',
      Friendly: 'Hi! Thank you so much — we really appreciate you taking the time to share your experience. We are thrilled to hear your event was a success! Our team puts so much heart into every event, and your kind words mean the world to us. We would love to host your next celebration! 🎉',
      Apologetic: 'Dear Host, Thank you for your positive feedback. We are glad your event was a success, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again!',
      Empathetic: 'Hi there! Thank you for sharing such a kind review — we truly appreciate it. It means so much to our whole team to hear that we made your event special. We look forward to hosting your next celebration! 🎉',
      Enthusiastic: 'Wow, thank you so much! We are absolutely thrilled to hear you loved your experience! Our entire team is so excited and grateful. Got another event coming up? We would love to host you! 🎉',
    },
    Negative: {
      Professional: 'Dear Host, We sincerely apologize for any inconvenience you experienced. We take all feedback seriously and are actively working to address your concerns. Please contact us directly so we can discuss this further. Sincerely, Venue Management',
      Friendly: 'Hi there, I am truly sorry to hear your experience was not what you expected. Your feedback means a lot to us — we have shared this with our team so we can do better. Please reach out to us directly so we can make this right. We are committed to making every event special.',
      Apologetic: 'Dear Host, We are deeply sorry that your experience did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right.',
      Empathetic: 'Hi there, I can only imagine how disappointing that experience must have been, and I am so sorry. Your trust means everything to us. Please reach out to us directly — we truly want to make this right.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough experience — that is not okay! We want to personally make this better for you right away. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Host, Thank you for your review. We value your feedback and are continually looking for ways to improve. We hope to host your next event soon. Best regards, Venue Team',
      Friendly: 'Hi there! Thank you for your feedback — we always appreciate hearing from our hosts. We are always looking to improve, and your input helps us throw better events. We would love to host your next celebration! 🎉',
      Apologetic: 'Dear Host, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your event went! We are always excited to get better and better for you. Cannot wait to host your next event! 🎉',
    },
  },
  'Spiritual Shop': {
    Positive: {
      Professional: 'Dear Valued Customer, Thank you for your wonderful review. We are delighted to hear that you had a great experience at our spiritual shop. Your satisfaction is our greatest reward, and we look forward to welcoming you back soon. Warm regards, The Spiritual Shop Team',
      Friendly: 'Hi! Thank you so much — your kind words really made our whole day! We are thrilled to hear you found something special at our shop. Our team carefully curates every item with love, and your support means the world to us. Come back anytime! 🕉️',
      Apologetic: 'Dear Customer, Thank you for your positive feedback. We are glad you found what you were looking for, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again!',
      Empathetic: 'Hi there! Thank you for sharing such a kind review — we truly appreciate it. It means so much to our whole team to hear that we made your spiritual journey a little brighter. We look forward to seeing you again! 🕉️',
      Enthusiastic: 'Wow, thank you so much! We are absolutely thrilled to hear you loved your experience! Our entire team is so excited and grateful. Cannot wait to welcome you back — you made our day! 🕉️',
    },
    Negative: {
      Professional: 'Dear Customer, We sincerely apologize for any inconvenience you experienced. We take all feedback seriously and are actively working to address your concerns. Please contact us directly so we can discuss this further. Sincerely, Spiritual Shop Management',
      Friendly: 'Hi there, I am truly sorry to hear your experience was not what you expected. Your feedback means a lot to us — we have shared this with our team so we can do better. Please reach out to us directly so we can make this right.',
      Apologetic: 'Dear Customer, We are deeply sorry that your visit did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right.',
      Empathetic: 'Hi there, I can only imagine how disappointing that experience must have been, and I am so sorry. Your trust means everything to us. Please reach out to us directly — we truly want to make this right.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough experience — that is not okay! We want to personally make this better for you right away. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Customer, Thank you for your review. We value your feedback and are continually looking for ways to improve. We hope to welcome you back soon. Best regards, Spiritual Shop Team',
      Friendly: 'Hi there! Thank you for your feedback — we always appreciate hearing from our customers. We are always looking to improve, and your input helps us serve you better. Come back anytime! 🕉️',
      Apologetic: 'Dear Customer, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your visit went! We are always excited to get better and better for you. Cannot wait to see you again! 🕉️',
    },
  },
  'Wellness Center': {
    Positive: {
      Professional: 'Dear Valued Guest, Thank you for your wonderful review. We are delighted to hear that you had a great experience at our wellness center. Your satisfaction is our greatest reward, and we look forward to helping you on your wellness journey soon. Warm regards, The Wellness Center Team',
      Friendly: 'Hi! Thank you so much — your kind words really made our whole day! We are thrilled to hear you felt the benefit of everything we offer. Our team is dedicated to your wellbeing, and your support means the world to us. Come back anytime! 🌸',
      Apologetic: 'Dear Guest, Thank you for your positive feedback. We are glad you felt well taken care of, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again!',
      Empathetic: 'Hi there! Thank you for sharing such a kind review — we truly appreciate it. It means so much to our whole team to hear that we supported your wellness journey. We look forward to seeing you again! 🌸',
      Enthusiastic: 'Wow, thank you so much! We are absolutely thrilled to hear you loved your experience! Our entire team is so excited and grateful. Cannot wait to welcome you back — you made our day! 🌸',
    },
    Negative: {
      Professional: 'Dear Guest, We sincerely apologize for any inconvenience you experienced. We take all feedback seriously and are actively working to address your concerns. Please contact us directly so we can discuss this further. Sincerely, Wellness Center Management',
      Friendly: 'Hi there, I am truly sorry to hear your experience was not what you expected. Your feedback means a lot to us — we have shared this with our team so we can do better. Please reach out to us directly so we can make this right.',
      Apologetic: 'Dear Guest, We are deeply sorry that your visit did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right.',
      Empathetic: 'Hi there, I can only imagine how disappointing that experience must have been, and I am so sorry. Your trust means everything to us. Please reach out to us directly — we truly want to make this right.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough experience — that is not okay! We want to personally make this better for you right away. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Guest, Thank you for your review. We value your feedback and are continually looking for ways to improve. We hope to welcome you back soon. Best regards, Wellness Center Team',
      Friendly: 'Hi there! Thank you for your feedback — we always appreciate hearing from our guests. We are always looking to improve, and your input helps us serve you better. Come back anytime! 🌸',
      Apologetic: 'Dear Guest, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your visit went! We are always excited to get better and better for you. Cannot wait to see you again! 🌸',
    },
  },
  'E-commerce Store': {
    Positive: {
      Professional: 'Dear Valued Customer, Thank you for your wonderful review. We are delighted to hear that you had a great experience shopping with us. Your satisfaction is our greatest reward, and we look forward to serving you again soon. Warm regards, The E-commerce Team',
      Friendly: 'Hi! Thank you so much — your kind words really made our whole day! We are thrilled to hear you loved your order. Our team works hard to make every delivery special, and your support means the world to us. Shop with us again anytime! 🛒',
      Apologetic: 'Dear Customer, Thank you for your positive feedback. We are glad you loved your order, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again!',
      Empathetic: 'Hi there! Thank you for sharing such a kind review — we truly appreciate it. It means so much to our whole team to hear that we made your shopping experience a great one. We look forward to seeing you again! 🛒',
      Enthusiastic: 'Wow, thank you so much! We are absolutely thrilled to hear you loved your experience! Our entire team is so excited and grateful. Cannot wait to fulfill your next order — you made our day! 🛒',
    },
    Negative: {
      Professional: 'Dear Customer, We sincerely apologize for any inconvenience you experienced with your order. We take all feedback seriously and are actively working to address your concerns. Please contact us directly so we can discuss this further. Sincerely, E-commerce Management',
      Friendly: 'Hi there, I am truly sorry to hear your experience was not what you expected. Your feedback means a lot to us — we have shared this with our team so we can do better. Please reach out to us directly so we can make this right.',
      Apologetic: 'Dear Customer, We are deeply sorry that your experience did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right.',
      Empathetic: 'Hi there, I can only imagine how frustrating that experience must have been, and I am so sorry. Your trust means everything to us. Please reach out to us directly — we truly want to make this right.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough experience — that is not okay! We want to personally make this better for you right away. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Customer, Thank you for your review. We value your feedback and are continually looking for ways to improve. We hope to serve you again soon. Best regards, E-commerce Team',
      Friendly: 'Hi there! Thank you for your feedback — we always appreciate hearing from our customers. We are always looking to improve, and your input helps us serve you better. Shop with us again anytime! 🛒',
      Apologetic: 'Dear Customer, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your order went! We are always excited to get better and better for you. Cannot wait to serve you again! 🛒',
    },
  },
  'Jewellery Store': {
    Positive: {
      Professional: 'Dear Valued Customer, Thank you for your wonderful review. We are delighted to hear that you had a great experience at our jewellery store. Your satisfaction is our greatest reward, and we look forward to helping you find your next piece soon. Warm regards, The Jewellery Team',
      Friendly: 'Hi! Thank you so much — your kind words really made our whole day! We are thrilled to hear you found something beautiful. Our team carefully selects every piece, and your support means the world to us. Come back anytime! 💎',
      Apologetic: 'Dear Customer, Thank you for your positive feedback. We are glad you found something you love, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again!',
      Empathetic: 'Hi there! Thank you for sharing such a kind review — we truly appreciate it. It means so much to our whole team to hear that we helped you find something special. We look forward to seeing you again! 💎',
      Enthusiastic: 'Wow, thank you so much! We are absolutely thrilled to hear you loved your experience! Our entire team is so excited and grateful. Cannot wait to help you find your next favorite piece — you made our day! 💎',
    },
    Negative: {
      Professional: 'Dear Customer, We sincerely apologize for any inconvenience you experienced. We take all feedback seriously and are actively working to address your concerns. Please contact us directly so we can discuss this further. Sincerely, Jewellery Store Management',
      Friendly: 'Hi there, I am truly sorry to hear your experience was not what you expected. Your feedback means a lot to us — we have shared this with our team so we can do better. Please reach out to us directly so we can make this right.',
      Apologetic: 'Dear Customer, We are deeply sorry that your visit did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right.',
      Empathetic: 'Hi there, I can only imagine how disappointing that experience must have been, and I am so sorry. Your trust means everything to us. Please reach out to us directly — we truly want to make this right.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough experience — that is not okay! We want to personally make this better for you right away. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Customer, Thank you for your review. We value your feedback and are continually looking for ways to improve. We hope to welcome you back soon. Best regards, Jewellery Team',
      Friendly: 'Hi there! Thank you for your feedback — we always appreciate hearing from our customers. We are always looking to improve, and your input helps us serve you better. Come back anytime! 💎',
      Apologetic: 'Dear Customer, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your visit went! We are always excited to get better and better for you. Cannot wait to see you again! 💎',
    },
  },
  'Real Estate': {
    Positive: {
      Professional: 'Dear Valued Client, Thank you for your wonderful review. We are delighted to hear that you had a great experience with our real estate services. Your satisfaction is our greatest reward, and we look forward to helping you with all your property needs soon. Warm regards, The Real Estate Team',
      Friendly: 'Hi! Thank you so much — your kind words really made our whole day! We are thrilled to hear we helped you find your dream property. Our team is dedicated to making your real estate journey smooth, and your support means the world to us. Let us know how we can help next! 🏡',
      Apologetic: 'Dear Client, Thank you for your positive feedback. We are glad you had a great experience, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again!',
      Empathetic: 'Hi there! Thank you for sharing such a kind review — we truly appreciate it. It means so much to our whole team to hear that we made your real estate journey a great one. We look forward to helping you again! 🏡',
      Enthusiastic: 'Wow, thank you so much! We are absolutely thrilled to hear you loved your experience! Our entire team is so excited and grateful. Got another property in mind? We would love to help — you made our day! 🏡',
    },
    Negative: {
      Professional: 'Dear Client, We sincerely apologize for any inconvenience you experienced. We take all feedback seriously and are actively working to address your concerns. Please contact us directly so we can discuss this further. Sincerely, Real Estate Management',
      Friendly: 'Hi there, I am truly sorry to hear your experience was not what you expected. Your feedback means a lot to us — we have shared this with our team so we can do better. Please reach out to us directly so we can make this right.',
      Apologetic: 'Dear Client, We are deeply sorry that your experience did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right.',
      Empathetic: 'Hi there, I can only imagine how disappointing that experience must have been, and I am so sorry. Your trust means everything to us. Please reach out to us directly — we truly want to make this right.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough experience — that is not okay! We want to personally make this better for you right away. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Client, Thank you for your review. We value your feedback and are continually looking for ways to improve. We hope to help you with your property needs soon. Best regards, Real Estate Team',
      Friendly: 'Hi there! Thank you for your feedback — we always appreciate hearing from our clients. We are always looking to improve, and your input helps us serve you better. Let us know how we can help next! 🏡',
      Apologetic: 'Dear Client, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your experience went! We are always excited to get better and better for you. Cannot wait to help you again! 🏡',
    },
  },
  'Online Boutique': {
    Positive: {
      Professional: 'Dear Valued Customer, Thank you for your wonderful review. We are delighted to hear that you had a great experience at our online boutique. Your satisfaction is our greatest reward, and we look forward to serving you again soon. Warm regards, The Online Boutique Team',
      Friendly: 'Hi! Thank you so much — your kind words really made our whole day! We are thrilled to hear you loved your order. Our team curates every piece with love, and your support means the world to us. Shop with us again anytime! 👗',
      Apologetic: 'Dear Customer, Thank you for your positive feedback. We are glad you loved your order, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again!',
      Empathetic: 'Hi there! Thank you for sharing such a kind review — we truly appreciate it. It means so much to our whole team to hear that we made your shopping experience a great one. We look forward to seeing you again! 👗',
      Enthusiastic: 'Wow, thank you so much! We are absolutely thrilled to hear you loved your experience! Our entire team is so excited and grateful. Cannot wait to fulfill your next order — you made our day! 👗',
    },
    Negative: {
      Professional: 'Dear Customer, We sincerely apologize for any inconvenience you experienced with your order. We take all feedback seriously and are actively working to address your concerns. Please contact us directly so we can discuss this further. Sincerely, Online Boutique Management',
      Friendly: 'Hi there, I am truly sorry to hear your experience was not what you expected. Your feedback means a lot to us — we have shared this with our team so we can do better. Please reach out to us directly so we can make this right.',
      Apologetic: 'Dear Customer, We are deeply sorry that your experience did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right.',
      Empathetic: 'Hi there, I can only imagine how disappointing that experience must have been, and I am so sorry. Your trust means everything to us. Please reach out to us directly — we truly want to make this right.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough experience — that is not okay! We want to personally make this better for you right away. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Customer, Thank you for your review. We value your feedback and are continually looking for ways to improve. We hope to serve you again soon. Best regards, Online Boutique Team',
      Friendly: 'Hi there! Thank you for your feedback — we always appreciate hearing from our customers. We are always looking to improve, and your input helps us serve you better. Shop with us again anytime! 👗',
      Apologetic: 'Dear Customer, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your order went! We are always excited to get better and better for you. Cannot wait to serve you again! 👗',
    },
  },
  Other: {
    Positive: {
      Professional: 'Dear Valued Customer, We sincerely appreciate your positive feedback. It is wonderful to hear that we met your expectations. Our team is dedicated to providing exceptional service, and your support motivates us tremendously. We look forward to serving you again. Warm regards, The Team',
      Friendly: 'Hi! Thank you so much — your kind words really mean the world to us. We are thrilled to hear you had a great experience. Our team works hard to make every customer feel valued, and your review inspires us to keep going strong. We would love to welcome you back soon! 🤗',
      Apologetic: 'Dear Customer, Thank you for your positive feedback. We are glad you had a great experience, and we appreciate your support. We will continue working hard to maintain the quality you expect. Thank you again!',
      Empathetic: 'Hi there! Thank you for sharing such a kind review — we truly appreciate it. It means so much to our whole team to hear that we made your experience a great one. We look forward to seeing you again!',
      Enthusiastic: 'Wow, thank you so much! We are absolutely thrilled to hear you loved your experience! Our entire team is so excited and grateful. Cannot wait to welcome you back — you made our day! 🤗',
    },
    Negative: {
      Professional: 'Dear Customer, We apologize for the disappointment you experienced. Your feedback is extremely important to us, and we are taking immediate steps to address the issues raised. Please contact us directly so we can work toward a resolution. Sincerely, Management',
      Friendly: 'Hi there, I am truly sorry to hear your experience did not meet your expectations. That really matters to us, and we have shared your feedback with our team. Please reach out to us directly — we would love the chance to make this right.',
      Apologetic: 'Dear Customer, We are deeply sorry that your experience did not meet your expectations. This is not the standard of service we strive for, and we sincerely apologize. We have addressed this with our team immediately. Please contact us so we can make this right.',
      Empathetic: 'Hi there, I can only imagine how disappointing that experience must have been, and I am so sorry. Your trust means everything to us. Please reach out to us directly — we truly want to make this right.',
      Enthusiastic: 'Oh no! I am so sorry to hear you had a rough experience — that is not okay! We want to personally make this better for you right away. Please reach out so we can sort it out together!',
    },
    Neutral: {
      Professional: 'Dear Customer, Thank you for your review. We are committed to continuously improving our customer experience. Your feedback is invaluable in helping us identify areas where we can do better. We hope to have the pleasure of serving you again in the future. Best regards, The Team',
      Friendly: 'Hi! Thank you for your feedback! We truly appreciate you taking the time to share your thoughts. Every review helps us grow and get better. We would love to welcome you back sometime and show you what we are all about. 💛',
      Apologetic: 'Dear Customer, Thank you for taking the time to share your thoughts. We appreciate your feedback and are committed to improving. We hope to have the pleasure of serving you again in the future.',
      Empathetic: 'Hi there, thank you for sharing your experience with us. We truly appreciate you taking the time to let us know how we are doing. Your feedback helps us grow. We hope to welcome you back soon.',
      Enthusiastic: 'Hey! Thank you so much for the feedback — we really appreciate you letting us know how your experience went! We are always excited to get better and better for you. Cannot wait to see you again! 💛',
    },
  },
}

