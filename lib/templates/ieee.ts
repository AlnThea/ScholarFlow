// lib/templates/ieee.ts

export function getIeeeTemplate(language: 'en' | 'id') {
  return [
    { 
      id: "h-ieee-0-" + Math.random().toString(36).substring(2, 9), 
      type: "header", 
      data: { 
        text: language === 'en' ? "Abstract" : "Abstrak", 
        level: 2 
      } 
    },
    { 
      id: "p-ieee-0-" + Math.random().toString(36).substring(2, 9), 
      type: "paragraph", 
      data: { 
        text: language === 'en' 
          ? "This paper presents a sentiment analysis model for classification of e-commerce customer reviews using bidirectional Long Short-Term Memory (BiLSTM) networks. Customer feedback plays a pivotal role in consumer decision-making and product enhancement. However, processing large volumes of unstructured reviews remains challenging. Our proposed model achieves 92.4% accuracy on a dataset of 10,000 product reviews, outperforming traditional machine learning methods such as Support Vector Machines (SVM) by 5.2%." 
          : "Makalah ini menyajikan model analisis sentimen untuk klasifikasi ulasan pelanggan e-commerce menggunakan jaringan bidirectional Long Short-Term Memory (BiLSTM). Masukan pelanggan memainkan peran penting dalam pengambilan keputusan konsumen dan penyempurnaan produk. Namun, memproses ulasan tidak terstruktur dalam jumlah besar tetap menantang. Model yang kami usulkan mencapai akurasi 92,4% pada dataset berisi 10.000 ulasan produk, melampaui metode pembelajaran mesin tradisional seperti Support Vector Machines (SVM) sebesar 5,2%." 
      } 
    },
    { 
      id: "h-ieee-1-" + Math.random().toString(36).substring(2, 9), 
      type: "header", 
      data: { 
        text: language === 'en' ? "I. Introduction" : "I. Pendahuluan", 
        level: 2 
      } 
    },
    { 
      id: "p-ieee-1-" + Math.random().toString(36).substring(2, 9), 
      type: "paragraph", 
      data: { 
        text: language === 'en' 
          ? "With the exponential growth of online shopping, millions of customer reviews are generated daily across e-commerce platforms. Analyzing these reviews provides businesses with actionable insights. Previous research has utilized bags-of-words representation, which fails to capture context. Deep learning models, especially recurrent networks, have emerged as strong alternatives due to their ability to capture sequential dependencies in text data." 
          : "Dengan pertumbuhan belanja daring yang eksponensial, jutaan ulasan pelanggan dibuat setiap hari di berbagai platform e-commerce. Menganalisis ulasan ini memberi bisnis wawasan yang dapat ditindaklanjuti. Penelitian sebelumnya menggunakan representasi bag-of-words, yang gagal menangkap konteks kalimat. Model pembelajaran mendalam, khususnya jaringan rekuren, telah muncul sebagai alternatif kuat karena kemampuannya dalam menangkap dependensi sekuensial pada data teks." 
      } 
    },
    { 
      id: "h-ieee-2-" + Math.random().toString(36).substring(2, 9), 
      type: "header", 
      data: { 
        text: language === 'en' ? "II. Proposed Methodology" : "II. Metodologi yang Diusulkan", 
        level: 2 
      } 
    },
    { 
      id: "p-ieee-2-" + Math.random().toString(36).substring(2, 9), 
      type: "paragraph", 
      data: { 
        text: language === 'en' 
          ? "The proposed framework consists of four primary stages: preprocessing, word embedding, BiLSTM layers, and a classification layer. Text preprocessing involves tokenization, stop-word removal, and lemmatization. For word embedding, we utilize pre-trained Word2Vec vectors to project words into a dense vector space. The BiLSTM layer extracts temporal features from both forward and backward directions, which are then passed to a dense output layer with a softmax activation function." 
          : "Kerangka kerja yang diusulkan terdiri dari empat tahap utama: pra-pemrosesan, penyematan kata (word embedding), lapisan BiLSTM, dan lapisan klasifikasi. Pra-pemrosesan teks melibatkan tokenisasi, penghapusan stop-word, dan lematisasi. Untuk penyematan kata, kami memanfaatkan vektor Word2Vec yang telah dilatih sebelumnya untuk memproyeksikan kata ke dalam ruang vektor padat. Lapisan BiLSTM mengekstrak fitur temporal dari arah maju dan mundur, yang kemudian diteruskan ke lapisan keluaran padat dengan fungsi aktivasi softmax." 
      } 
    },
    { 
      id: "h-ieee-3-" + Math.random().toString(36).substring(2, 9), 
      type: "header", 
      data: { 
        text: language === 'en' ? "III. Experimental Evaluation & Results" : "III. Evaluasi Eksperimen & Hasil", 
        level: 2 
      } 
    },
    { 
      id: "p-ieee-3-" + Math.random().toString(36).substring(2, 9), 
      type: "paragraph", 
      data: { 
        text: language === 'en' 
          ? "Experiments were conducted on an Amazon product reviews dataset. We partitioned the dataset into 80% training, 10% validation, and 10% testing splits. Model optimization was performed using the Adam optimizer with a learning rate of 0.001. The proposed BiLSTM architecture achieved a precision of 91.8% and a recall of 93.0%. Confusion matrix analysis indicates that the model excels at detecting highly positive and negative sentiments, though neutral reviews present moderate classification challenges." 
          : "Eksperimen dilakukan pada dataset ulasan produk Amazon. Kami membagi dataset menjadi 80% pelatihan, 10% validasi, dan 10% pengujian. Optimasi model dilakukan menggunakan pengoptimasi Adam dengan learning rate 0,001. Arsitektur BiLSTM yang diusulkan mencapai presisi 91,8% dan recall 93,0%. Analisis confusion matrix menunjukkan bahwa model ini sangat baik dalam mendeteksi sentimen yang sangat positif dan negatif, meskipun ulasan netral memberikan tantangan klasifikasi tingkat sedang." 
      } 
    },
    { 
      id: "h-ieee-4-" + Math.random().toString(36).substring(2, 9), 
      type: "header", 
      data: { 
        text: language === 'en' ? "IV. Conclusion" : "IV. Kesimpulan", 
        level: 2 
      } 
    },
    { 
      id: "p-ieee-4-" + Math.random().toString(36).substring(2, 9), 
      type: "paragraph", 
      data: { 
        text: language === 'en' 
          ? "In this study, we successfully developed a deep learning framework for classifying customer reviews in the e-commerce domain. By leveraging BiLSTM and Word2Vec, the model successfully captures semantic context and sentence structures. Future investigations will focus on integrating attention mechanisms to weigh key sentiment-bearing words more heavily, as well as evaluating model generalization on multilingual review corpora." 
          : "Dalam studi ini, kami berhasil mengembangkan kerangka pembelajaran mendalam untuk mengklasifikasikan ulasan pelanggan di domain e-commerce. Dengan memanfaatkan BiLSTM dan Word2Vec, model ini berhasil menangkap konteks semantik dan struktur kalimat. Penelitian di masa depan akan berfokus pada pengintegrasian mekanisme atensi (attention mechanism) untuk memberikan bobot lebih pada kata-kata kunci pembawa sentimen, serta mengevaluasi generalisasi model pada korpus ulasan multibahasa." 
      } 
    }
  ];
}
