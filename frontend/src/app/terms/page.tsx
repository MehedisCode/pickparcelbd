import { PublicFooter, PublicHeader } from "@/components/shell";
export default function Page() {
  return (
    <>
      <PublicHeader />
      <main
        className="public-container terms-content"
        style={{ maxWidth: 900 }}
      >
        <h1>PickParcelBD Terms & Conditions</h1>
        <div className="updated">
          অর্ডার/Parcel Booking করার আগে অনুগ্রহ করে নিচের শর্তগুলো পড়ুন।
        </div>
        <div className="note">
          Order Confirm করার মাধ্যমে আপনি ঘোষণা করছেন যে আপনার দেওয়া তথ্য সঠিক
          এবং PickParcelBD-এর delivery ও payment সম্পর্কিত নিয়মগুলো মেনে চলতে
          সম্মত।
        </div>
        <h2>১. সঠিক তথ্য প্রদান</h2>
        <p>
          Buyer/Seller/Receiver-এর নাম, ফোন নম্বর, ঠিকানা, জেলা, উপজেলা এবং
          প্রয়োজনীয় অন্যান্য তথ্য সঠিকভাবে দিতে হবে। ভুল বা অসম্পূর্ণ তথ্যের
          কারণে delivery ব্যর্থ হলে তার দায় সংশ্লিষ্ট তথ্য প্রদানকারীর।
        </p>
        <h2>২. Order Confirm</h2>
        <p>
          Order Confirm করার পর Seller-এর কাছে Order পাঠানো হবে এবং প্রয়োজনীয়
          delivery process শুরু হতে পারে। Confirm করার আগে product, quantity,
          delivery information এবং payment method যাচাই করুন।
        </p>
        <h2>৩. Delivery ও Receiver</h2>
        <p>
          Receiver-কে delivery সময় প্রয়োজনীয় authentication/OTP দিতে হতে পারে।
          Receiver-এর পরিচয় ও parcel গ্রহণের তথ্য সঠিক না হলে delivery সম্পন্ন
          নাও হতে পারে।
        </p>
        <h2>৪. Cash on Delivery (COD)</h2>
        <p>
          COD নির্বাচন করলে নির্ধারিত collection amount Receiver-এর কাছ থেকে
          সংগ্রহ করা হবে। COD amount এবং delivery charge ভুলভাবে প্রদান করা হলে
          তা দ্রুত সংশ্লিষ্ট পক্ষকে জানাতে হবে।
        </p>
        <h2>৫. Cancellation, Return ও Fraud Prevention</h2>
        <p>
          ইচ্ছাকৃতভাবে বারবার order cancel/return করা, ভুয়া তথ্য দেওয়া, অন্যের
          পরিচয় ব্যবহার করা বা delivery process বাধাগ্রস্ত করা গ্রহণযোগ্য নয়।
          নিরাপত্তার প্রয়োজনে order history ও delivery history যাচাই করা হতে
          পারে।
        </p>
        <h2>৬. Parcel ও নিষিদ্ধ সামগ্রী</h2>
        <p>
          আইনবিরোধী, বিপজ্জনক, নিষিদ্ধ বা অন্যের ক্ষতি করতে পারে এমন সামগ্রী
          পাঠানো যাবে না। Sender তার parcel-এর content-এর জন্য দায়ী।
        </p>
        <h2>৭. Payment ও Delivery Charge</h2>
        <p>
          Order বা Parcel Booking-এর সময় প্রদর্শিত applicable delivery
          charge/payment তথ্য দেখে confirm করুন। কোনো তথ্য নিয়ে সমস্যা হলে
          process সম্পন্ন করার আগে সংশ্লিষ্ট পক্ষের সঙ্গে যোগাযোগ করুন।
        </p>
        <h2>৮. Privacy</h2>
        <p>
          ব্যবহারকারীর ব্যক্তিগত তথ্য প্রয়োজনীয় service, delivery, security এবং
          fraud prevention কাজে ব্যবহার করা হতে পারে। Phone visibility setting
          অনুযায়ী সাধারণ ব্যবহারকারীর কাছে ফোন নম্বর Public বা Private রাখা যেতে
          পারে; authorized Rider/Agent delivery কাজের প্রয়োজন অনুযায়ী প্রয়োজনীয়
          তথ্য দেখতে পারে।
        </p>
        <h2>৯. Account Security</h2>
        <p>
          নিজের account ও login information নিরাপদ রাখুন। আপনার account থেকে করা
          কার্যক্রমের জন্য account holder দায়ী থাকবেন, যদি না প্রমাণিত হয় যে তা
          অননুমোদিতভাবে ব্যবহৃত হয়েছে।
        </p>
        <h2>১০. শর্ত পরিবর্তন</h2>
        <p>
          Service, security বা operational প্রয়োজন অনুযায়ী এই Terms & Conditions
          আপডেট হতে পারে। নতুন order confirm করার সময় সর্বশেষ শর্ত প্রযোজ্য হবে।
        </p>
        <h2>১১. সম্মতি</h2>
        <p>
          “Agree & Confirm Order” নির্বাচন করে আপনি উপরোক্ত Terms & Conditions
          পড়েছেন, বুঝেছেন এবং মেনে চলতে সম্মত হয়েছেন বলে গণ্য হবে।
        </p>
      </main>
      <PublicFooter />
    </>
  );
}
