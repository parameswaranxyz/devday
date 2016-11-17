import { DevdayEvent, Address, AgendaEntry, AgendaEntryType } from './../definitions';

export const BANGALORE_ADDRESS: Address = {
      line_one: '#365, 3rd Floor, Sulochana Building',
      line_two: '1st Cross Road, 3rd Block, Sarjapura Main Road',
      locality: 'Koramangala',
      city: 'Bangalore',
      zip: 560034,
      map_link: 'https://goo.gl/maps/ziSASk4tmvM2',
      map_image: 'images/bangalore-map.jpg'
    };
export const CHENNAI_ADDRESS: Address = {
      line_one: 'Sahaj Software Solutions Pvt. Ltd.',
      line_two: 'Type 2/15, Dr.V.S.I Estate, Rajiv Gandhi Salai',
      locality: 'Thiruvanmiyur',
      city: 'Chennai',
      zip: 600041,
      map_link: 'https://goo.gl/maps/7Z8iBAdjT1o',
      map_image: 'images/chennai-map.png'
    };

export const events: DevdayEvent[] = [
  {
    title: 'Data science: How it helps',
    url: 'data-science-how-it-helps',
    categories: ['events'],
    tags: ['data-science'],
    author: 'devday_ team',
    abstract: 'On this 3 Edition of DevDay, we have Viral B. Shah, co-inventor of JuliaLang, and other speakers from Sahaj, to share their  experiences and learnings on Data Science.',
    event_time: {
      start_time: new Date('2016-05-07T10:30:00+05:30'),
      end_time: new Date('2016-05-07T13:30:00+05:30'),
    },
    publish_time: new Date('2016-05-07T10:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-05-07T10:30:00+05:30'),
      end_time: new Date('2016-05-07T13:30:00+05:30')
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Julia - A fresh approach to data science and technical computing',
        abstract: '',
        authors: [
          {
            name: "Viral B. Shah",
            image_url: 'images/speakers/viral-shah.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-05-07T10:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-04-02T11:15:00+05:30')
        },
        title: 'Tea Break'
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Applied data science for developers',
        abstract: '',
        authors: [
          {
            name: 'Unknown'
          }
        ],
        time: {
          start_time: new Date('2016-05-07T11:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-05-07T13:00:00+05:30')
        },
        title: 'Lunch Break'
      } as AgendaEntry
    ]
  },
  {
    title: 'All about databases',
    url: 'all-about-databases',
    categories: ['events'],
    tags: ['databases','sqlite','event streams'],
    author: 'devday_ team',
    abstract: 'A Date with Databases. This meet up would be all about Databases - the internals and the overall. The idea is to tear down databases, across relational/non relational, and understand them deep down.',
    event_time: {
      start_time: new Date('2016-06-04T10:30:00+05:30'),
      end_time: new Date('2016-06-04T13:30:00+05:30'),
    },
    publish_time: new Date('2016-06-04T10:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-06-04T10:30:00+05:30'),
      end_time: new Date('2016-06-04T10:30:00+05:30')
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Databases: Days of the future past',
        abstract: '',
        authors: [
          {
            name: "Avinash Nijampure"
          }
        ],
        time: {
          start_time: new Date('2016-06-04T10:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-06-04T11:15:00+05:30')
        },
        title: 'Tea and snacks'
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'SQLite: Why aren\'t you using it more?',
        abstract: '',
        authors: [
          {
            name: 'Srimathi Harinarayanan',
            image_url: 'images/speakers/srimathi.jpg'
          },
          {
            name: 'Navaneeth KN',
            image_url: 'images/speakers/navneeth.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-06-04T11:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Databases as event streams',
        abstract: '',
        authors: [
          {
            name: 'Shashank Teotia',
            image_url: 'images/speakers/shashank-teotia.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-06-04T12:15:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-06-04T13:00:00+05:30')
        },
        title: 'Lunch'
      } as AgendaEntry
    ]
  },
  {
    title: 'Arduino Day',
    url: 'arduino-day',
    categories: ['events'],
    tags: ['arduino-genuino-iot'],
    author: 'devday_ team',
    abstract: 'Arduino Day is a worldwide birthday celebration of Arduino and Genuino. It\'s a one day event –organized directly by the community, or by the Arduino founders– where people interested in Arduino and Genuino get together, share their experiences, and learn more.',
    event_time: {
      start_time: new Date('2016-04-02T10:30:00+05:30'),
      end_time: new Date('2016-04-02T14:30:00+05:30'),
    },
    publish_time: new Date('2016-04-02T10:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-04-02T10:30:00+05:30'),
      end_time: new Date('2016-04-02T10:30:00+05:30')
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Adventures with Arduino',
        abstract: '',
        authors: [
          {
            name: "Himesh Reddivari",
            image_url: 'images/speakers/himesh-reddivari.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-04-02T10:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-04-02T11:15:00+05:30')
        },
        title: 'Tea Break'
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Journey of Samvid',
        abstract: '',
        authors: [
          {
            name: 'Shashank Teotia',
            image_url: 'images/speakers/shashank-teotia.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-04-02T11:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Simple obstacle avoiding Robot using Arduino',
        abstract: '',
        authors: [
          {
            name: 'Deepak Nararyana Rao',
            image_url: 'images/speakers/deepak.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-04-02T12:15:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Workshop,
        title: 'Workshop on Arduino',
        abstract: '',
        authors: [
          {
            name: 'Deepak Nararyana Rao',
            image_url: 'images/speakers/deepak.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-04-02T13:00:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-06-04T13:45:00+05:30')
        },
        title: 'Lunch Break'
      } as AgendaEntry
    ]
  },
  {
    title: 'Cloud Computing',
    url: 'cloud-computing',
    categories: ['events'],
    tags: ['cloud computing','cloud'],
    author: 'devday_ team',
    abstract: 'Upload. Download. Dock. Serve. Functions on demand. Everything to do with the cloud.',
    event_time: {
      start_time: new Date('2016-07-09T10:30:00+05:30'),
      end_time: new Date('2016-07-09T13:30:00+05:30'),
    },
    publish_time: new Date('2016-07-09T10:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-07-09T10:30:00+05:30'),
      end_time: new Date('2016-07-09T10:30:00+05:30')
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Product For Blue - <br>Green Deployments Verification',
        abstract: '',
        authors: [
          {
            name: "Srikanth Seshadri",
            image_url: 'images/speakers/srikanth.png'
          }
        ],
        time: {
          start_time: new Date('2016-07-09T10:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-07-09T11:15:00+05:30')
        },
        title: 'Tea and snacks'
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Misconceptions of cloud: Automation!',
        abstract: '',
        authors: [
          {
            name: 'Arther Antony',
            image_url: 'images/speakers/arther.png'
          }
        ],
        time: {
          start_time: new Date('2016-07-09T11:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Introduction to DevOps, the pain-points and the frameworks',
        abstract: '',
        authors: [
          {
            name: 'Raghavendrra Mahesh',
            image_url: 'images/speakers/mahesh.png'
          }
        ],
        time: {
          start_time: new Date('2016-07-09T12:15:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Break,
        time: {
          start_time: new Date('2016-07-09T13:00:00+05:30')
        },
        title: 'Lunch Break'
      } as AgendaEntry
    ],
    color: 'black',
    image_url: 'images/events/cloud_computing.jpg'
  },
  {
    title: 'JS Everywhere',
    url: 'js-everywhere',
    categories: ['events'],
    tags: ['js','javascript', 'react-native', 'cycle-js'],
    author: 'devday_ team',
    abstract: 'Desktop or offline applications? We\'ve got you covered. Reactive applications? Try cycle. Native moblie applications? We have React Native. Internet of Things? Johnny Five\'s here to help. JavaScript has evolved into one of the easiest and ubiquitous language around, and it looks like there isn\'t much that can\'t be done with it. JS Everywhere - Let\'s rejoice!',
    event_time: {
      start_time: new Date('2016-08-04T18:30:00+05:30'),
      end_time: new Date('2016-08-04T20:30:00+05:30'),
    },
    publish_time: new Date('2016-08-04T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-08-04T18:30:00+05:30'),
      end_time: new Date('2016-08-04T18:30:00+05:30')
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Creating offline/desktop applications using Electron',
        abstract: '',
        authors: [
          {
            name: 'Sairam Krishnamurthy',
            image_url: 'images/speakers/sairam.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-08-04T18:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Building native mobile applications using React Native',
        abstract: '',
        authors: [
          {
            name: 'Vagmi Mudumbai',
            image_url: 'images/speakers/vagmi.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-08-04T19:00:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Functional Reactive Programming with Cycle.js',
        abstract: '',
        authors: [
          {
            name: 'Sudarsan Balaji',
            image_url: 'images/speakers/sudarsan.png'
          }
        ],
        time: {
          start_time: new Date('2016-08-04T19:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Writing for IoT using Johnny-Five',
        abstract: '',
        authors: [
          {
            name: 'Raj Bharath Kannan',
            image_url: 'images/speakers/raj.png'
          }
        ],
        time: {
          start_time: new Date('2016-04-02T13:00:00+05:30')
        }
      } as AgendaEntry
    ],
    color: '#f7df1e',
    background_size: '200px',
    image_url: 'images/events/js_everywhere.png',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '232886624'
  },
  {
    title: 'Tasting Elixir',
    url: 'tasting-elixir',
    categories: ['events'],
    tags: ['elixir','functional programming', 'concurrent programming'],
    author: 'devday_ team',
    abstract: 'We bring to you Elixir - a concurrent, functional programming language.',
    event_time: {
      start_time: new Date('2016-08-27T10:30:00+05:30'),
      end_time: new Date('2016-08-28T13:30:00+05:30'),
    },
    publish_time: new Date('2016-07-09T10:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-08-27T10:30:00+05:30'),
      end_time: new Date('2016-08-28T13:30:00+05:30'),
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Workshop,
        title: 'Hands-On with Elixir',
        abstract: '',
        authors: [
          {
            name: "Navaneeth N",
            image_url: 'images/speakers/navneeth.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-08-27T10:30:00+05:30')
        }
      } as AgendaEntry
    ],
    color: '#211b33',
    image_url: 'images/events/tasting_elixir.jpg',
    meetup_urlname: 'devday_bangalore',
    meetup_event_id: '233530425'
  },
  {
    title: 'This time it\'s real-time',
    url: 'its-real-time',
    categories: ['events'],
    tags: ['real-time','rtc', 'webrtc', 'peer-js'],
    author: 'devday_ team',
    abstract: 'In this edition of Dev Day (Chennai) we have talks scheduled on RTC. Come learn about aspects of real time communication and the way real time systems are built.',
    event_time: {
      start_time: new Date('2016-09-10T10:00:00+05:30'),
      end_time: new Date('2016-09-10T13:00:00+05:30'),
    },
    publish_time: new Date('2016-08-04T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-09-10T10:00:00+05:30'),
      end_time: new Date('2016-09-10T13:00:00+05:30'),
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'Realtime Chat using Socket.io on Production',
        abstract: 'The web has typically been a client request server protocol from the beginning of time. Websockets are starting to change that with a bi-directional data flow. This talk will explore how socket.io, a framework for websockets was used to develop a chat application that was on production.',
        authors: [
          {
            name: 'Arvind Sridharan',
            image_url: 'images/speakers/arvind.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-08-04T10:00:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Real Time Communication, Fast and Slow',
        abstract: 'Browsers and servers have always constituted a distributed system, and with the rise of (micro?)services, servers have now become distributed systems too. The fundamental need of any of these systems is to communicate effectively - we\'ll look at the various options and methods of doing just that.',
        authors: [
          {
            name: 'Sudhir Jonathan',
            image_url: 'images/speakers/sudhir.png'
          }
        ],
        time: {
          start_time: new Date('2016-08-04T11:00:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Getting started with WebRTC',
        abstract: 'WebRTC is a framework for the web that enables Real Time Communication in the browser. Get to know about WebRTC technology & also learn how to build a webrtc application.',
        authors: [
          {
            name: 'Vijayakumar Nagarajan',
            image_url: 'images/speakers/vijayakumar.png'
          }
        ],
        time: {
          start_time: new Date('2016-08-04T12:00:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#040509',
    image_url: 'images/events/its_real_time.jpg',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '232886624',
    form: {
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSd7wUzgQ7VuP3z41GtnTemaxFzv-4K10TuBHjCZqjcI8xxDJA/formResponse',
      name: 'entry.2092238618',
      email: 'entry.1556369182',
      mobile: 'entry.479301265',
      type: 'entry.630971362',
      title: 'entry.1832696420',
      abstract: 'entry.354689399'
    }
  },
  {
    title: 'Math For Machine Learning',
    url: 'Machine Learning',
    categories: ['Machine Learning'],
    tags: ['Machine Learning','Math', 'Data Science'],
    author: 'devday_ team',
    abstract: 'Learn about the basic math and algorithms required for machine learning',
    event_time: {
      start_time: new Date('2016-11-19T10:30:00+05:30'),
      end_time: new Date('2016-11-19T10:00:00+05:30')
    },
    publish_time: new Date('2016-11-15T23:45:00+05:30'),
    registration_time: {
      start_time: new Date('2016-11-15T23:45:00+05:30'),
      end_time: new Date('2016-11-19T09:45:00+05:30'),
    },
    venue: BANGALORE_ADDRESS,
    agenda: [
       {
        type: AgendaEntryType.Talk,
        title: 'Basic concepts of statistics and introduction to ML',
        abstract: 'Get started with basic statistics and see them in action with real-time datasets. Discuss the basic definitions of machine learning and also about when and when not to use ML. We will be using Python notebook to demonstrate the concepts.',
        authors: [
          {
            name: 'Deepthi Chand',
            image_url: 'http://sahajsoft.com/images/optimized/deepthi.png'
          }
        ],
        time: {
          start_time: new Date('2016-11-19T10:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Diving into machine learning with simple maths and statistics',
        abstract: "Ever felt intimidated by the nuances and world of machine learning? Come and hear someone reason about it using rudimentary maths and concepts like Euclidean distance and Pearson's correlation score to build a super simple recommendation engine and unsupervised clusters of data. Understand how linear regression allows for predictive capabilities on datasets. Look at how to build simple classifiers using python libraries without understanding the guts of machine learning. This talk uses python for the code. Classifiers are built using the nltk library with Python.",
        authors: [
          {
            name: 'Priyank Gupta',
            image_url: 'http://sahajsoft.com/images/optimized/priyank.png'
          }
        ],
        time: {
          start_time: new Date('2016-11-19T11:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Introduction to Linear Regression',
        abstract: '',
        authors: [
          {
            name: 'Shashank Teotia',
            image_url: 'http://sahajsoft.com/images/optimized/shashank.png'
          }
        ],
        time: {
          start_time: new Date('2016-11-19T12:30:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#211b33',
    meetup_urlname: 'devday_bangalore',
    meetup_event_id: '235590887',
    form: {
      spreadsheetId : 'AMjVe6j2Wmmc8eF4cB2JOzvEhbW_JGsuPQ',
      sheetName : 'DevDay - Nov (Math for Machine Learning)'
    },
    image_url: '/images/events/hackathon.jpg',
  },
  {
    title: 'Devops for Devs',
    url: 'devops-for-devs',
    categories: ['events'],
    tags: ['devops'],
    author: 'devday_ team',
    abstract: 'In this edition of the Dev Day, we are presenting talks on Devops - "DevOps for Devs". Come join us to understand why "DevOps" is relevant today from a technology standpoint',
    event_time: {
      start_time: new Date('2016-10-13T18:30:00+05:30'),
      end_time: new Date('2016-10-13T20:30:00+05:30'),
    },
    publish_time: new Date('2016-08-04T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-09-10T10:00:00+05:30'),
      end_time: new Date('2016-10-13T18:30:00+05:30'),
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Talk,
        title: 'DevOps 101',
        abstract: '',
        authors: [
          {
            name: 'Srimathi Harinarayanan',
            image_url: 'http://sahajsoft.com/images/optimized/srimathi.png'
          }
        ],
        time: {
          start_time: new Date('2016-08-13T18:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Ephemeral Infrastructure',
        abstract: '',
        authors: [
          {
            name: 'Mahesh and Arther',
            image_url: 'http://sahajsoft.com/images/optimized/mahesh.png'
          }
        ],
        time: {
          start_time: new Date('2016-08-13T18:45:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Talk,
        title: 'Kubernetes in Production',
        abstract: 'In this talk, Manoj will be talking about the Kubernetes setup at Indix which has been running for the last 10 months now. He will be going into the details of bringing up and managing a Kubernetes cluster and the features of Kubernetes that they use at Indix.',
        authors: [
          {
            name: 'Manoj Mahalingam',
            image_url: '/images/speakers/manoj.jpg'
          }
        ],
        time: {
          start_time: new Date('2016-08-13T19:30:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#040509',
    image_url: '/images/events/devops-for-devs.jpeg',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '234495890',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  },
  {
    title: 'Cross Platform Mobile Apps',
    url: 'cross-platform-mobile-apps-handson',
    categories: ['events'],
    tags: ['cross platform','mobile apps','handson'],
    author: 'devday_ team',
    abstract: 'Participants will form teams and pick a technology of their interest (i.e. Xamarin, Cordova, React Native) to build a cross platform mobile app. The app to be built is a todo list where users can add todo items with a photo and a location. The problem has been designed so that it can be built within a few hours.',
    event_time: {
      start_time: new Date('2016-11-19T10:00:00+05:30'),
      end_time: new Date('2016-11-19T15:00:00+05:30'),
    },
    publish_time: new Date('2016-08-04T18:30:00+05:30'),
    registration_time: {
      start_time: new Date('2016-09-10T10:00:00+05:30'),
      end_time: new Date('2016-11-19T10:00:00+05:30'),
    },
    venue: CHENNAI_ADDRESS,
    agenda: [
      {
        type: AgendaEntryType.Workshop,
        title: 'Introduction',
        abstract: 'A brief introduction to the event format along with a detailed explanation of the problem.',
        time: {
          start_time: new Date('2016-11-19T10:00:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Workshop,
        title: 'Team Formation',
        abstract: 'Participants will form teams based on their interest.',
        time: {
          start_time: new Date('2016-11-19T10:30:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Workshop,
        title: 'Get cracking with the code',
        abstract: 'Teams can organise their own lunch breaks during the coding time. Lunch will be provided by Sahaj.',
        time: {
          start_time: new Date('2016-11-19T10:45:00+05:30')
        }
      } as AgendaEntry,
      {
        type: AgendaEntryType.Workshop,
        title: 'Showcase and discussion',
        abstract: 'All the apps built will be showcased. This will be followed by a discussion on pros and cons of the technologies they the individual teams would have used to solve the problem.',
        time: {
          start_time: new Date('2016-11-19T14:00:00+05:30')
        }
      } as AgendaEntry,
    ],
    color: '#040509',
    image_url: 'images/events/cross_platform.jpg',
    meetup_urlname: 'devday_chennai',
    meetup_event_id: '235318558',
    form: {
      spreadsheetId : '1dySpYU4nW8mxVxkt8Zzju72HpuE_5DBdzU-RvwOVu18',
      sheetName : 'Form Responses 1'
    }
  }
];
export default events;
