patterns = [
    (r'hi|hello|hey', ['Hello!', 'Hi there!', 'Hey!']),
    (r'how are you?', ['I\'m good, thank you!',
     'I\'m doing well, thanks for asking.']),
    (r'what is your name?', [
     'You can call me NVIDIA Bot.', 'I go by the name NVIDIA Bot.']),
    (r'your name (.*)', ['You can call me NVIDIA Bot.',
     'I go by the name NVIDIA Bot.']),

    # Patterns related to NVIDIA products and technologies
    (r'(.*)(who|what)(.*)nvidia',
     ['NVIDIA is a leading technology company known for its graphics processing units (GPUs) and AI technologies. How can I assist you with NVIDIA products today?']),
    (r'(.*)(what)(.*)geforce',
     ['GeForce is a brand of graphics processing units (GPUs) produced by NVIDIA.']),
    (r'(.*)(what)(.*)cuda',
     ['CUDA is a parallel computing platform and programming model developed by NVIDIA.']),

    # Patterns related to support inquiries
    (r'(.*)support', ['For NVIDIA support, you can visit the official NVIDIA support page at https://www.nvidia.com/support/. If you have a specific issue, feel free to describe it, and Ill do my best to assist you.']),
    (r'help(.*)', ['How can I assist you today? If you have questions about NVIDIA products or need technical support, feel free to ask.']),

    # Patterns for general information
    (r'(.*)kinds of GPUs(.*)',
     ['NVIDIA offers a variety of GPUs, including GeForce, Quadro, and Tesla series. Is there a specific GPU you would like information about?']),
    (r'tech(.*)', ['NVIDIA is at the forefront of technology, specializing in GPUs, AI, and parallel computing. What specific information are you looking for?']),

    # Patterns for specific NVIDIA product lines
    (r'(.*)(who|what)(.*)quadro',
     ['NVIDIA Quadro GPUs are designed for professional graphics and workstation applications. What information are you looking for regarding Quadro GPUs?']),
    (r'(.*)(who|what)tesla',
     ['NVIDIA Tesla GPUs are designed for high-performance computing and AI workloads. How can I assist you with information about Tesla GPUs?']),

    # Patterns for specific GPU models
    (r'(.*)(who|what)(.*)rtx(\s*|-)(\d+)',
     ['The NVIDIA GeForce RTX {0} is a powerful GPU known for its ray tracing capabilities. Is there anything specific you\'d like to know about the RTX {0}?']),
    (r'gtx\s*(\d+)',
     ['The NVIDIA GeForce GTX {0} is a popular gaming GPU. How can I help you with information about the GTX {0}?']),

    # Patterns for driver-related inquiries
    (r'driver(s)?', ['For the latest NVIDIA drivers, you can visit the official NVIDIA driver download page at https://www.nvidia.com/drivers/. If you have specific driver-related questions, feel free to ask.']),
    (r'update\s*driver(s)?',
     ['To update your NVIDIA drivers, you can use the NVIDIA GeForce Experience application or download the latest drivers from https://www.nvidia.com/drivers/.']),

    # Patterns for gaming-related inquiries
    (r'game(.*)', ['NVIDIA GPUs are widely used for gaming. If you have questions about gaming setups, graphics settings, or game compatibility, feel free to ask.']),
    (r'optimize\s*game(s)?',
     ['For optimizing game settings on your NVIDIA GPU, you can use the NVIDIA GeForce Experience application. Need assistance with specific games?']),

    # Patterns for AI and deep learning
    (r'deep\s*learning',
     ['NVIDIA GPUs are commonly used for deep learning tasks. If you have questions about AI frameworks, CUDA, or deep learning applications, let me know.']),
    (r'cuda\s*toolkit',
     ['The CUDA Toolkit is a software development kit for parallel computing on NVIDIA GPUs. How can I assist you with CUDA Toolkit-related inquiries?']),

    # Patterns for purchase and availability
    (r'buy(.*)', ['To purchase NVIDIA products, you can visit the official NVIDIA store at https://store.nvidia.com/. If you have specific product availability questions, feel free to ask.']),
    (r'price(.*)', ['For information on the pricing of NVIDIA products, you can check the official NVIDIA store or authorized retailers.']),

    # Additional fallback patterns that are related to top 50 most frequent words in our site
    (r'(.*)(nvidia)(.*)', ['NVIDIA is a leading technology company known for its graphics processing units (GPUs) and AI technologies.',
     'NVIDIA develops cutting-edge technologies for various industries, including gaming, data centers, and autonomous vehicles.']),
    (r'(.*)(ai)(.*)', ['NVIDIA is at the forefront of AI technology, developing hardware and software for AI applications.',
     'NVIDIA offers a range of products and platforms for AI development, training, and deployment.']),
    (r'(.*)(rtx)(.*)', ['NVIDIA RTX GPUs feature dedicated hardware for real-time ray tracing and AI acceleration.',
     'RTX GPUs provide stunning visuals and enhanced performance for gaming, content creation, and AI workloads.']),
    (r'(.*)(data)(.*)', ['NVIDIA offers solutions for accelerating data analytics and processing large datasets.',
     'NVIDIA GPUs and software can significantly speed up data-intensive applications and workflows.']),
    (r'(.*)(cloud)(.*)', ['NVIDIA provides cloud-based services and solutions for GPU-accelerated computing.',
     'NVIDIA NGC cloud offers access to GPU-accelerated software, containers, and pre-trained models.']),
    (r'(.*)(computing)(.*)', ['NVIDIA GPUs are designed for high-performance computing and accelerating a wide range of applications.',
     'NVIDIA CUDA and GPU computing technologies enable parallel processing for faster and more efficient computations.']),
    (r'(.*)(geforce)(.*)', ['GeForce is a brand of graphics processing units (GPUs) produced by NVIDIA.',
     'GeForce GPUs are designed for gaming and professional visualization.']),
    (r'(.*)(cores)(.*)', ['NVIDIA GPUs feature thousands of CUDA cores for parallel processing.',
     'The number of CUDA cores in a GPU determines its computational power and performance.']),
    (r'(.*)(edge)(.*)', ['NVIDIA offers edge computing solutions for AI and IoT applications.',
     'NVIDIA Edge computing platforms enable AI processing and inference at the edge, closer to where data is generated.']),
    (r'(.*)(gpu)(.*)', ['NVIDIA GPUs are powerful processors designed for graphics rendering and parallel computing.',
     'NVIDIA GPUs can accelerate various applications, from gaming and content creation to scientific simulations and AI.']),
    (r'(.*)(center)(.*)', ['NVIDIA DGX systems are purpose-built AI data center solutions.',
     'NVIDIA data center solutions provide high-performance computing for AI, data analytics, and scientific workloads.']),
    (r'(.*)(studio)(.*)', ['NVIDIA Studio is a platform for creators, designed to accelerate creative workflows.',
     'NVIDIA Studio provides optimized drivers, SDKs, and tools for content creation, rendering, and video editing.']),
    (r'(.*)(video)(.*)', ['NVIDIA offers GPUs and software solutions for video processing and encoding.',
     'NVIDIA video technologies enable high-quality video streaming, transcoding, and real-time video analytics.']),
    (r'(.*)(gb)(.*)', ['GB (gigabyte) refers to the amount of memory (VRAM) available on a GPU.',
     'Higher GB values indicate more memory, which is important for handling demanding graphics and compute workloads.']),
    (r'(.*)(laptops)(.*)', ['NVIDIA GPUs are available in various laptop models for gaming, content creation, and professional use.',
     'NVIDIA GPUs in laptops offer portability and performance for on-the-go graphics and computing needs.']),
    (r'(.*)(training)(.*)', ['NVIDIA provides hardware and software solutions for accelerating AI model training.',
     'NVIDIA GPUs and platforms can significantly speed up the training process for deep learning models.']),
    (r'(.*)(gddr6)(.*)', ['GDDR6 is a type of high-performance graphics memory used in modern NVIDIA GPUs.',
     'GDDR6 memory offers higher bandwidth and performance compared to previous generations, benefiting graphics and compute workloads.']),
    (r'(.*)(analytics)(.*)', ['NVIDIA offers GPU-accelerated analytics solutions for processing large datasets.',
     'NVIDIA GPUs and software can accelerate data analytics, machine learning, and business intelligence workloads.']),
    (r'(.*)(software)(.*)', ['NVIDIA develops a range of software solutions for various industries and applications.',
     'NVIDIA software includes drivers, SDKs, libraries, and tools for developers, data scientists, and content creators.']),
    (r'(.*)(enterprise)(.*)', ['NVIDIA offers enterprise-grade solutions for data centers, cloud computing, and AI deployment.',
     'NVIDIA enterprise products and platforms are designed for high performance, scalability, and security.']),
    (r'(.*)(robotics)(.*)', ['NVIDIA provides hardware and software solutions for robotics and autonomous systems.',
     'NVIDIA technologies enable advanced perception, navigation, and control capabilities for robots and autonomous vehicles.']),
    (r'(.*)(solutions)(.*)', ['NVIDIA offers end-to-end solutions for various industries and applications.',
     'NVIDIA solutions combine hardware, software, and services to address specific customer needs and use cases.']),
    (r'(.*)(performance)(.*)', ['NVIDIA products are designed to deliver high performance for graphics, computing, and AI workloads.',
     'NVIDIA GPUs and technologies enable outstanding performance and efficiency across various applications.']),
    (r'(.*)(omniverse)(.*)', ['NVIDIA Omniverse is a platform for creating and operating industrial metaverse applications.',
     'Omniverse enables collaborative design, simulation, and operation of digital twins and virtual worlds.']),
    (r'(.*)(icon)(.*)', ['NVIDIA ICON is a platform for AI robotics and intelligent video analytics.',
     'NVIDIA ICON provides tools and software for developing and deploying AI-powered robotic applications.']),
    (r'(.*)(support)(.*)', ['NVIDIA offers technical support and resources for its products and solutions.',
     'NVIDIA support includes documentation, forums, and professional services to assist customers.']),
    (r'(.*)(simulation)(.*)', ['NVIDIA provides GPU-accelerated solutions for scientific and engineering simulations.',
     'NVIDIA GPUs and software can accelerate various simulation workloads, such as computational fluid dynamics (CFD) and finite element analysis (FEA).']),
    (r'(.*)(learning)(.*)', ['NVIDIA offers hardware and software solutions for machine learning and deep learning applications.',
     'NVIDIA technologies enable efficient training and deployment of AI models for various use cases.']),
    (r'(.*)(inference)(.*)', ['NVIDIA provides solutions for accelerating AI inference and deploying trained models.',
     'NVIDIA GPUs and platforms can accelerate real-time inference for AI applications, such as object detection and natural language processing.']),
    (r'(.*)(blog)(.*)', ['The NVIDIA blog provides news, updates, and insights into NVIDIA technologies and products.',
     'The NVIDIA blog covers topics related to gaming, data centers, AI, and other areas where NVIDIA operates.']),
    (r'(.*)(ngc)(.*)', ['NVIDIA NGC is a cloud-based platform for GPU-accelerated software and pre-trained models.',
     'NGC provides access to optimized containers, SDKs, and resources for AI, data science, and high-performance computing.']),
    (r'(.*)(learn)(.*)', ['NVIDIA offers various learning resources, including tutorials, courses, and certifications.',
     'NVIDIA learning resources help developers, data scientists, and professionals expand their skills in GPU computing and AI.']),
    (r'(.*)(resources)(.*)', ['NVIDIA provides a range of resources, such as documentation, developer tools, and support forums.',
     'NVIDIA resources assist users and developers in leveraging NVIDIA products and technologies effectively.']),
    (r'(.*)(workflows)(.*)', ['NVIDIA offers optimized workflows and solutions for various industries and applications.',
     'NVIDIA workflows combine hardware, software, and best practices to streamline specific workloads and use cases.']),
    (r'(.*)(developer)(.*)', ['NVIDIA provides developer tools, SDKs, and resources for software development.',
     'NVIDIA developer resources enable the creation of applications that leverage the power of GPUs and AI technologies.']),
    (r'(.*)(gaming)(.*)', ['NVIDIA offers GPUs and technologies specifically designed for gaming and gaming experiences.',
     'NVIDIA gaming solutions provide high performance, advanced graphics features, and immersive experiences for gamers.']),
    (r'(.*)(management)(.*)', ['NVIDIA provides management tools and solutions for data center and enterprise environments.',
     'NVIDIA management tools enable efficient deployment, monitoring, and optimization of GPU-accelerated workloads.']),
    (r'(.*)(industries)(.*)', ['NVIDIA technologies and solutions are used across various industries, including gaming, data centers, automotive, and more.',
     'NVIDIA offerings cater to the specific needs of different industries, enabling accelerated computing and AI capabilities.']),
    (r'(.*)(virtual)(.*)', ['NVIDIA offers solutions for virtual environments, such as virtual desktops and virtual workstations.',
     'NVIDIA virtual solutions enable remote access to GPU-accelerated applications and high-performance computing resources.']),
    (r'(.*)(experience)(.*)', ['NVIDIA aims to provide exceptional user experiences through its products and technologies.',
     'NVIDIA invests in delivering high-performance, efficient, and immersive experiences across various applications and use cases.']),
    (r'(.*)(cuda)(.*)', ['CUDA is a parallel computing platform and programming model developed by NVIDIA.',
     'CUDA enables developers to accelerate applications by leveraging the parallel computing power of NVIDIA GPUs.']),
    (r'(.*)(products)(.*)', ['NVIDIA offers a wide range of products, including GPUs, DGX systems, and software solutions.',
     'NVIDIA products cater to various markets, such as gaming, data centers, AI, and professional visualization.']),
    (r'(.*)(accelerated)(.*)', ['NVIDIA provides GPU-accelerated solutions for various applications and workloads.',
     'NVIDIA GPU acceleration enables faster processing, higher performance, and improved efficiency for compute-intensive tasks.']),
    (r'(.*)(shop)(.*)', ['The NVIDIA online shop allows customers to purchase NVIDIA products and merchandise.',
     'The NVIDIA shop offers GPUs, systems, accessories, and branded merchandise for individuals and businesses.']),
    (r'(.*)(technical)(.*)', ['NVIDIA provides technical resources, documentation, and support for its products and solutions.',
     'NVIDIA technical resources assist developers, IT professionals, and users in leveraging NVIDIA technologies effectively.']),
    (r'(.*)(networking)(.*)', ['NVIDIA offers networking solutions for high-performance data centers and cloud environments.',
     'NVIDIA networking technologies enable efficient data movement and low-latency communication for GPU-accelerated workloads.']),
    (r'(.*)(research)(.*)', ['NVIDIA conducts research and development in various areas, including AI, graphics, and computing technologies.',
     'NVIDIA research efforts aim to push the boundaries of technology and drive innovation in various fields.']),
    (r'(.*)(workstations)(.*)', ['NVIDIA offers GPU-accelerated workstations for professional applications and workflows.',
     'NVIDIA workstations provide high-performance computing power for tasks like 3D rendering, simulations, and data analysis.']),
    (r'(.*)(platform)(.*)', ['NVIDIA offers hardware and software platforms for GPU computing and AI applications.',
     'NVIDIA platforms provide an integrated ecosystem of tools, libraries, and solutions for accelerated computing workflows.']),

    # Patterns for general assistance and fallback
    (r'thank\s*you',
     ['You\'re welcome! If you have any more questions or need assistance, feel free to ask.']),
    (r'(.*)', ['I\'m sorry, I may not have the information you\'re looking for. If you have specific questions about NVIDIA products or support, please let me know, and I\'ll do my best to assist you.']),
]
