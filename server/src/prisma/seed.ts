import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu khởi tạo kho dữ liệu đề thi đa dạng cho các cấp học...');

  // 1. Dọn sạch dữ liệu cũ theo thứ tự ràng buộc
  await prisma.attemptAnswer.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  // 2. Mật khẩu mặc định: 123456
  const passwordHash = await bcrypt.hash('123456', 10);

  // 3. Tạo các giáo viên đại diện các môn và cấp học
  const teacherNam = await prisma.user.create({
    data: {
      name: 'Thầy Nam (Chuyên Toán)',
      email: 'nam.math@wayground.edu.vn',
      password: passwordHash,
      role: 'TEACHER',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const teacherLinh = await prisma.user.create({
    data: {
      name: 'Cô Mai Linh (IELTS 8.5)',
      email: 'linh.english@wayground.edu.vn',
      password: passwordHash,
      role: 'TEACHER',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
  });

  const teacherHoang = await prisma.user.create({
    data: {
      name: 'Thầy Hoàng (KHTN & Vật Lý)',
      email: 'hoang.science@wayground.edu.vn',
      password: passwordHash,
      role: 'TEACHER',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    },
  });

  const teacherTrang = await prisma.user.create({
    data: {
      name: 'Cô Thu Trang (Ngữ Văn & Xã Hội)',
      email: 'trang.van@wayground.edu.vn',
      password: passwordHash,
      role: 'TEACHER',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
  });

  const teacherDev = await prisma.user.create({
    data: {
      name: 'DevMaster Academy',
      email: 'dev@wayground.edu.vn',
      password: passwordHash,
      role: 'TEACHER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 4. Tạo 8 danh mục môn học bao quát đầy đủ
  const subMath = await prisma.subject.create({
    data: {
      name: 'Toán Học',
      slug: 'toan-hoc',
      icon: 'Calculator',
      color: '#3B82F6',
      description: 'Số học, Đại số, Hình học phẳng, Giải tích, Hình học không gian',
    },
  });

  const subEnglish = await prisma.subject.create({
    data: {
      name: 'Tiếng Anh',
      slug: 'tieng-anh',
      icon: 'Languages',
      color: '#EC4899',
      description: 'Ngữ pháp, từ vựng, đọc hiểu THPTQG, TOEIC, IELTS',
    },
  });

  const subLiterature = await prisma.subject.create({
    data: {
      name: 'Ngữ Văn & Tiếng Việt',
      slug: 'ngu-van',
      icon: 'BookOpen',
      color: '#F59E0B',
      description: 'Văn học dân gian, văn học hiện đại, biện pháp tu từ, ngữ pháp tiếng Việt',
    },
  });

  const subPhysics = await prisma.subject.create({
    data: {
      name: 'Vật Lý',
      slug: 'vat-ly',
      icon: 'Zap',
      color: '#8B5CF6',
      description: 'Cơ học, áp suất, điện từ trường, dao động & sóng cơ học',
    },
  });

  const subChemistry = await prisma.subject.create({
    data: {
      name: 'Hóa Học',
      slug: 'hoa-hoc',
      icon: 'FlaskConical',
      color: '#06B6D4',
      description: 'Phản ứng vô cơ, Este - Lipit, Amin, Polime, hóa học phân tích',
    },
  });

  const subBiology = await prisma.subject.create({
    data: {
      name: 'Sinh Học',
      slug: 'sinh-hoc',
      icon: 'Dna',
      color: '#10B981',
      description: 'Di truyền học, quy luật Men-đen, tiến hóa, sinh thái học',
    },
  });

  const subSocial = await prisma.subject.create({
    data: {
      name: 'Lịch Sử & Địa Lý',
      slug: 'lich-su-dia-ly',
      icon: 'Globe',
      color: '#D97706',
      description: 'Lịch sử Việt Nam, lịch sử thế giới, địa lý tự nhiên và kinh tế xã hội',
    },
  });

  const subIT = await prisma.subject.create({
    data: {
      name: 'Công Nghệ Thông Tin',
      slug: 'tin-hoc-cntt',
      icon: 'Code',
      color: '#6366F1',
      description: 'Lập trình JavaScript, Python, CSDL SQL, Cấu trúc dữ liệu & Thuật toán',
    },
  });

  console.log('✅ Đã tạo 8 danh mục môn học và 5 tài khoản giáo viên.');

  // =========================================================================
  // 5. CẤP 1: TIỂU HỌC (PRIMARY)
  // =========================================================================

  // Đề 1: Toán 5 - PRIMARY
  await prisma.exam.create({
    data: {
      title: 'Toán 5: Ôn Luyện Phép Tính Số Thập Phân & Diện Tích Hình Học',
      description: 'Kiểm tra kỹ năng cộng, trừ, nhân, chia số thập phân và tính diện tích hình tam giác, hình thang dành cho học sinh lớp 5.',
      coverImage: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop&q=80',
      gradeLevel: 'PRIMARY',
      subjectId: subMath.id,
      creatorId: teacherNam.id,
      creatorName: teacherNam.name,
      durationMinutes: 20,
      accessCode: '111001',
      isPublic: true,
      viewCount: 420,
      attemptCount: 180,
      questions: {
        create: [
          {
            content: 'Kết quả của phép tính: $45{,}8 + 17{,}45$ là:',
            explanation: 'Đặt tính thẳng hàng dấu phẩy: $45{,}80 + 17{,}45 = 63{,}25$.',
            difficulty: 'EASY',
            orderIndex: 0,
            options: {
              create: [
                { content: '63,25', isCorrect: true, orderIndex: 0 },
                { content: '62,25', isCorrect: false, orderIndex: 1 },
                { content: '63,5', isCorrect: false, orderIndex: 2 },
                { content: '52,25', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'Một hình tam giác có độ dài đáy là $12\\text{ cm}$ và chiều cao tương ứng là $8\\text{ cm}$. Diện tích của hình tam giác đó là:',
            explanation: 'Công thức diện tích tam giác: $S = \\frac{a \\times h}{2} = \\frac{12 \\times 8}{2} = 48\\text{ cm}^2$.',
            difficulty: 'EASY',
            orderIndex: 1,
            options: {
              create: [
                { content: '48 cm²', isCorrect: true, orderIndex: 0 },
                { content: '96 cm²', isCorrect: false, orderIndex: 1 },
                { content: '24 cm²', isCorrect: false, orderIndex: 2 },
                { content: '20 cm²', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'Chữ số 7 trong số thập phân $135{,}274$ có giá trị là:',
            explanation: 'Chữ số 7 nằm ở hàng phần trăm, nên giá trị của nó là $\\frac{7}{100}$ hay $0{,}07$.',
            difficulty: 'EASY',
            orderIndex: 2,
            options: {
              create: [
                { content: '7 phần trăm (0,07)', isCorrect: true, orderIndex: 0 },
                { content: '7 phần mười (0,7)', isCorrect: false, orderIndex: 1 },
                { content: '7 phần nghìn (0,007)', isCorrect: false, orderIndex: 2 },
                { content: '7 đơn vị', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  // Đề 2: Tiếng Việt 5 - PRIMARY
  await prisma.exam.create({
    data: {
      title: 'Tiếng Việt 5: Luyện Từ Và Câu, Đại Từ & Biện Pháp Tu Từ',
      description: 'Ôn tập phân biệt từ đồng nghĩa, từ đồng âm, từ nhiều nghĩa và nhận biết biện pháp nghệ thuật so sánh, nhân hóa.',
      coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
      gradeLevel: 'PRIMARY',
      subjectId: subLiterature.id,
      creatorId: teacherTrang.id,
      creatorName: teacherTrang.name,
      durationMinutes: 15,
      accessCode: '111002',
      isPublic: true,
      viewCount: 310,
      attemptCount: 145,
      questions: {
        create: [
          {
            content: 'Trong câu: "Mặt trời đội biển nhô màu mới", từ nào được sử dụng theo biện pháp nhân hóa?',
            explanation: 'Hành động "đội" là hành động của con người, được gán cho "Mặt trời" tạo nên hình ảnh nhân hóa sinh động.',
            difficulty: 'EASY',
            orderIndex: 0,
            options: {
              create: [
                { content: 'đội', isCorrect: true, orderIndex: 0 },
                { content: 'nhô', isCorrect: false, orderIndex: 1 },
                { content: 'biển', isCorrect: false, orderIndex: 2 },
                { content: 'mới', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'Cặp từ nào dưới đây là từ đồng âm?',
            explanation: '"Đậu" trong "hạt đậu" (danh từ thực vật) và "đậu" trong "đỗ tương đậu trên cành" (động từ hạ cánh) đồng âm nhưng hoàn toàn khác nghĩa.',
            difficulty: 'MEDIUM',
            orderIndex: 1,
            options: {
              create: [
                { content: 'Hạt đậu - Chim đậu trên cành', isCorrect: true, orderIndex: 0 },
                { content: 'Mênh mông - Bao la', isCorrect: false, orderIndex: 1 },
                { content: 'Đen nhánh - Trắng tinh', isCorrect: false, orderIndex: 2 },
                { content: 'Chân bàn - Chân người', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  // Đề 3: Tiếng Anh Tiểu học - PRIMARY
  await prisma.exam.create({
    data: {
      title: 'Tiếng Anh Tiểu Học: Từ Vựng & Cấu Trúc Căn Bản (Movers / Flyers)',
      description: 'Bài kiểm tra từ vựng về đồ dùng học tập, động vật, thời gian và các cấu trúc hỏi đáp quen thuộc của học sinh tiểu học.',
      coverImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80',
      gradeLevel: 'PRIMARY',
      subjectId: subEnglish.id,
      creatorId: teacherLinh.id,
      creatorName: teacherLinh.name,
      durationMinutes: 15,
      accessCode: '111003',
      isPublic: true,
      viewCount: 380,
      attemptCount: 160,
      questions: {
        create: [
          {
            content: 'Choose the correct word: "Look! The children _______ soccer in the schoolyard right now."',
            explanation: 'Dấu hiệu "right now" và "Look!" chỉ thì Hiện tại tiếp diễn: S + is/am/are + V-ing. "The children" là số nhiều nên dùng "are playing".',
            difficulty: 'EASY',
            orderIndex: 0,
            options: {
              create: [
                { content: 'are playing', isCorrect: true, orderIndex: 0 },
                { content: 'plays', isCorrect: false, orderIndex: 1 },
                { content: 'played', isCorrect: false, orderIndex: 2 },
                { content: 'play', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'How _______ books are there in your backpack?',
            explanation: '"Books" là danh từ đếm được số nhiều, câu hỏi số lượng dùng "How many".',
            difficulty: 'EASY',
            orderIndex: 1,
            options: {
              create: [
                { content: 'many', isCorrect: true, orderIndex: 0 },
                { content: 'much', isCorrect: false, orderIndex: 1 },
                { content: 'long', isCorrect: false, orderIndex: 2 },
                { content: 'often', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  // =========================================================================
  // 6. CẤP 2: THCS (SECONDARY)
  // =========================================================================

  // Đề 4: Toán 9 Vào 10 - SECONDARY
  await prisma.exam.create({
    data: {
      title: 'Toán 9: Luyện Thi Tuyển Sinh Vào Lớp 10 (Đại Số & Hình Tròn)',
      description: 'Chuyên đề rút gọn căn bậc hai, định lý Vi-ét, phương trình bậc hai và góc với đường tròn theo cấu trúc đề thi tuyển sinh 10.',
      coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80',
      gradeLevel: 'SECONDARY',
      subjectId: subMath.id,
      creatorId: teacherNam.id,
      creatorName: teacherNam.name,
      durationMinutes: 30,
      accessCode: '222001',
      isPublic: true,
      viewCount: 890,
      attemptCount: 420,
      questions: {
        create: [
          {
            content: 'Rút gọn biểu thức $A = \\sqrt{(2 - \\sqrt{5})^2} + \\sqrt{5}$ ta được kết quả:',
            explanation: 'Áp dụng hằng đẳng thức $\\sqrt{A^2} = |A|$. Vì $2 < \\sqrt{5}$ nên $|2 - \\sqrt{5}| = \\sqrt{5} - 2$. Khi đó $A = (\\sqrt{5} - 2) + \\sqrt{5} = 2\\sqrt{5} - 2$ hay ngược lại: $\\sqrt{5} - 2 + \\sqrt{5}$? Hãy kiểm tra: $2 - \\sqrt{5} < 0 \\implies |2 - \\sqrt{5}| = \\sqrt{5} - 2$. Cộng với $\\sqrt{5}$ cho $2\\sqrt{5} - 2$. Hoặc biểu thức là $A = \\sqrt{(3 - \\sqrt{5})^2} + \\sqrt{5} = 3 - \\sqrt{5} + \\sqrt{5} = 3$. Ở đây với $|\\sqrt{5} - 2| + \\sqrt{5} = 2\\sqrt{5} - 2$.',
            difficulty: 'MEDIUM',
            orderIndex: 0,
            options: {
              create: [
                { content: '2\\sqrt{5} - 2', isCorrect: true, orderIndex: 0 },
                { content: '2', isCorrect: false, orderIndex: 1 },
                { content: '-2', isCorrect: false, orderIndex: 2 },
                { content: '2\\sqrt{5} + 2', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'Cho phương trình $x^2 - 5x + 6 = 0$. Theo hệ thức Vi-ét, tổng $x_1 + x_2$ và tích $x_1 x_2$ của hai nghiệm là:',
            explanation: 'Phương trình bậc hai $ax^2 + bx + c = 0$ có $x_1 + x_2 = -\\frac{b}{a} = 5$ và $x_1 x_2 = \\frac{c}{a} = 6$.',
            difficulty: 'EASY',
            orderIndex: 1,
            options: {
              create: [
                { content: 'x₁ + x₂ = 5 và x₁x₂ = 6', isCorrect: true, orderIndex: 0 },
                { content: 'x₁ + x₂ = -5 và x₁x₂ = 6', isCorrect: false, orderIndex: 1 },
                { content: 'x₁ + x₂ = 5 và x₁x₂ = -6', isCorrect: false, orderIndex: 2 },
                { content: 'x₁ + x₂ = -5 và x₁x₂ = -6', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'Tứ giác $ABCD$ nội tiếp đường tròn khi và chỉ khi:',
            explanation: 'Định lý tứ giác nội tiếp: Tứ giác có tổng hai góc đối diện bằng $180^\\circ$.',
            difficulty: 'EASY',
            orderIndex: 2,
            options: {
              create: [
                { content: 'Tổng hai góc đối nhau bằng 180°', isCorrect: true, orderIndex: 0 },
                { content: 'Hai cạnh đối song song', isCorrect: false, orderIndex: 1 },
                { content: 'Hai đường chéo bằng nhau', isCorrect: false, orderIndex: 2 },
                { content: 'Bốn cạnh bằng nhau', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  // Đề 5: Ngữ Văn 9 - SECONDARY
  await prisma.exam.create({
    data: {
      title: 'Ngữ Văn 9: Trọng Tâm Tác Phẩm & Phân Tích Tiếng Việt Vào 10',
      description: 'Tổng hợp câu hỏi trắc nghiệm văn học trung đại và hiện đại lớp 9: Truyện Kiều, Đồng chí, Làng, Ánh trăng, cùng phần tiếng Việt khởi ngữ.',
      coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80',
      gradeLevel: 'SECONDARY',
      subjectId: subLiterature.id,
      creatorId: teacherTrang.id,
      creatorName: teacherTrang.name,
      durationMinutes: 20,
      accessCode: '222002',
      isPublic: true,
      viewCount: 650,
      attemptCount: 290,
      questions: {
        create: [
          {
            content: 'Hình tượng "Đầu súng trăng treo" trong bài thơ "Đồng chí" của Chính Hữu mang ý nghĩa biểu tượng gì?',
            explanation: 'Hình ảnh súng và trăng là sự kết hợp hài hòa giữa hiện thực chiến đấu khốc liệt và tinh thần lãng mạn cách mạng, giữa chiến sĩ và thi sĩ.',
            difficulty: 'MEDIUM',
            orderIndex: 0,
            options: {
              create: [
                { content: 'Sự kết hợp giữa hiện thực chiến đấu khốc liệt và chất lãng mạn cách mạng', isCorrect: true, orderIndex: 0 },
                { content: 'Ánh trăng soi sáng đường hành quân trong đêm', isCorrect: false, orderIndex: 1 },
                { content: 'Nỗi nhớ quê hương da diết của người lính nông dân', isCorrect: false, orderIndex: 2 },
                { content: 'Chiến tranh đã hoàn toàn kết thúc và hòa bình lập lại', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'Trong câu: "Còn mắt tôi thì các anh lái xe bảo: Cô có cái nhìn sao mà xa xăm!", thành phần "Còn mắt tôi" giữ vai trò ngữ pháp gì?',
            explanation: '"Còn mắt tôi" đứng trước chủ ngữ để nêu lên đề tài được nói đến trong câu, đó chính là thành phần Khởi ngữ.',
            difficulty: 'EASY',
            orderIndex: 1,
            options: {
              create: [
                { content: 'Khởi ngữ', isCorrect: true, orderIndex: 0 },
                { content: 'Trạng ngữ chỉ nơi chốn', isCorrect: false, orderIndex: 1 },
                { content: 'Thành phần tình thái', isCorrect: false, orderIndex: 2 },
                { content: 'Thành phần phụ chú', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  // Đề 6: Tiếng Anh 9 - SECONDARY
  await prisma.exam.create({
    data: {
      title: 'Tiếng Anh 9: Đề Thi Thử Vào Lớp 10 Chuẩn Cấu Trúc Tuyển Sinh',
      description: 'Luyện đề trắc nghiệm tuyển sinh lớp 10 môn Tiếng Anh: ngữ âm phát âm, câu gián tiếp, câu điều kiện, câu bị động và mạo từ.',
      coverImage: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&auto=format&fit=crop&q=80',
      gradeLevel: 'SECONDARY',
      subjectId: subEnglish.id,
      creatorId: teacherLinh.id,
      creatorName: teacherLinh.name,
      durationMinutes: 25,
      accessCode: '222003',
      isPublic: true,
      viewCount: 780,
      attemptCount: 350,
      questions: {
        create: [
          {
            content: 'Choose the word whose underlined part is pronounced differently: A. invite**d** B. want**ed** C. decid**ed** D. look**ed**',
            explanation: 'Quy tắc phát âm đuôi "-ed": "looked" phát âm là /t/ sau âm vô thanh /k/. Các từ "invited", "wanted", "decided" đều kết thúc bằng /t/ hoặc /d/ nên phát âm là /ɪd/.',
            difficulty: 'EASY',
            orderIndex: 0,
            options: {
              create: [
                { content: 'looked (/t/)', isCorrect: true, orderIndex: 0 },
                { content: 'invited (/ɪd/)', isCorrect: false, orderIndex: 1 },
                { content: 'wanted (/ɪd/)', isCorrect: false, orderIndex: 2 },
                { content: 'decided (/ɪd/)', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: '"I will visit my grandparents tomorrow," Nam said. -> Nam said that he _______ his grandparents the following day.',
            explanation: 'Trong câu gián tiếp, "will" lùi thì thành "would", "my" đổi thành "his", "tomorrow" đổi thành "the following day".',
            difficulty: 'MEDIUM',
            orderIndex: 1,
            options: {
              create: [
                { content: 'would visit', isCorrect: true, orderIndex: 0 },
                { content: 'will visit', isCorrect: false, orderIndex: 1 },
                { content: 'visited', isCorrect: false, orderIndex: 2 },
                { content: 'had visited', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  // Đề 7: KHTN 8 - 9 (Vật Lý & Hóa) - SECONDARY
  await prisma.exam.create({
    data: {
      title: 'Khoa Học Tự Nhiên 8-9: Áp Suất, Lực Đẩy Archimedes & Phản Ứng Vô Cơ',
      description: 'Đề tổng hợp kiến thức Vật lý và Hóa học THCS: Áp suất chất lỏng, lực đẩy Acsimet, axit tác dụng với kim loại, dung dịch và nồng độ mol.',
      coverImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80',
      gradeLevel: 'SECONDARY',
      subjectId: subPhysics.id,
      creatorId: teacherHoang.id,
      creatorName: teacherHoang.name,
      durationMinutes: 20,
      accessCode: '222004',
      isPublic: true,
      viewCount: 460,
      attemptCount: 195,
      questions: {
        create: [
          {
            content: 'Lực đẩy Archimedes tác dụng lên một vật nhúng chìm trong chất lỏng phụ thuộc vào yếu tố nào?',
            explanation: 'Công thức lực đẩy Archimedes: $F_A = d \\times V$ (trong đó $d$ là trọng lượng riêng của chất lỏng, $V$ là thể tích phần chất lỏng bị vật chiếm chỗ).',
            difficulty: 'EASY',
            orderIndex: 0,
            options: {
              create: [
                { content: 'Trọng lượng riêng của chất lỏng và thể tích phần chìm của vật', isCorrect: true, orderIndex: 0 },
                { content: 'Khối lượng của vật và độ sâu của vật', isCorrect: false, orderIndex: 1 },
                { content: 'Hình dạng của vật và thời gian nhúng vật', isCorrect: false, orderIndex: 2 },
                { content: 'Nhiệt độ môi trường xung quanh', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'Khi cho lá kẽm ($Zn$) vào dung dịch axit clohiđric ($HCl$), hiện tượng quan sát được là:',
            explanation: 'Phương trình hóa học: $Zn + 2HCl \\rightarrow ZnCl_2 + H_2\\uparrow$. Lá kẽm tan dần và có bọt khí không màu $H_2$ thoát ra.',
            difficulty: 'EASY',
            orderIndex: 1,
            options: {
              create: [
                { content: 'Lá kẽm tan dần, có bọt khí không màu thoát ra', isCorrect: true, orderIndex: 0 },
                { content: 'Xuất hiện kết tủa màu trắng', isCorrect: false, orderIndex: 1 },
                { content: 'Dung dịch chuyển sang màu xanh lam', isCorrect: false, orderIndex: 2 },
                { content: 'Không có hiện tượng gì xảy ra', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  // Đề 8: Lịch Sử 9 - SECONDARY
  await prisma.exam.create({
    data: {
      title: 'Lịch Sử 9: Giai Đoạn Kháng Chiến & Lịch Sử Việt Nam Hiện Đại',
      description: 'Hệ thống các mốc lịch sử trọng đại: Cách mạng Tháng Tám năm 1945, Chiến dịch Điện Biên Phủ 1954 và Đại thắng mùa Xuân 1975.',
      coverImage: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=600&auto=format&fit=crop&q=80',
      gradeLevel: 'SECONDARY',
      subjectId: subSocial.id,
      creatorId: teacherTrang.id,
      creatorName: teacherTrang.name,
      durationMinutes: 15,
      accessCode: '222005',
      isPublic: true,
      viewCount: 380,
      attemptCount: 175,
      questions: {
        create: [
          {
            content: 'Chủ tịch Hồ Chí Minh đọc bản Tuyên ngôn Độc lập khai sinh ra nước Việt Nam Dân chủ Cộng hòa vào ngày tháng năm nào?',
            explanation: 'Ngày 2/9/1945 tại Quảng trường Ba Đình (Hà Nội), Chủ tịch Hồ Chí Minh đã đọc Tuyên ngôn Độc lập lịch sử.',
            difficulty: 'EASY',
            orderIndex: 0,
            options: {
              create: [
                { content: '02/09/1945', isCorrect: true, orderIndex: 0 },
                { content: '19/08/1945', isCorrect: false, orderIndex: 1 },
                { content: '07/05/1954', isCorrect: false, orderIndex: 2 },
                { content: '30/04/1975', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'Chiến thắng nào của quân và dân ta đã "lừng lẫy năm châu, chấn động địa cầu", buộc thực dân Pháp phải ký Hiệp định Giơ-ne-vơ năm 1954?',
            explanation: 'Chiến thắng lịch sử Điện Biên Phủ (kết thúc ngày 07/05/1954) đã giáng đòn quyết định đập tan ý chí xâm lược của thực dân Pháp.',
            difficulty: 'EASY',
            orderIndex: 1,
            options: {
              create: [
                { content: 'Chiến thắng Điện Biên Phủ', isCorrect: true, orderIndex: 0 },
                { content: 'Chiến dịch Việt Bắc Thu - Đông 1947', isCorrect: false, orderIndex: 1 },
                { content: 'Chiến dịch Biên Giới Thu - Đông 1950', isCorrect: false, orderIndex: 2 },
                { content: 'Chiến thắng Hà Nội - Điện Biên Phủ trên không 1972', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  // =========================================================================
  // 7. CẤP 3: THPT (HIGH_SCHOOL)
  // =========================================================================

  // Đề 9: Toán 12 Giải tích - HIGH_SCHOOL
  await prisma.exam.create({
    data: {
      title: 'Toán 12: Khảo Sát Hàm Số & Tích Phân Giải Tích (Chuẩn THPTQG)',
      description: 'Bộ câu hỏi trọng tâm về cực trị hàm số, tiệm cận, nguyên hàm và tích phân ứng dụng thực tế có công thức LaTeX sắc nét.',
      coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
      gradeLevel: 'HIGH_SCHOOL',
      subjectId: subMath.id,
      creatorId: teacherNam.id,
      creatorName: teacherNam.name,
      durationMinutes: 45,
      accessCode: '333001',
      isPublic: true,
      viewCount: 1420,
      attemptCount: 680,
      questions: {
        create: [
          {
            content: 'Tính tích phân sau: $I = \\int_{0}^{1} (2x + 1) dx$',
            explanation: 'Áp dụng công thức nguyên hàm: $\\int (2x + 1) dx = x^2 + x$. Thay cận từ 0 đến 1: $(1^2 + 1) - (0) = 2$.',
            difficulty: 'EASY',
            orderIndex: 0,
            options: {
              create: [
                { content: 'I = 2', isCorrect: true, orderIndex: 0 },
                { content: 'I = 1', isCorrect: false, orderIndex: 1 },
                { content: 'I = 3', isCorrect: false, orderIndex: 2 },
                { content: 'I = 4', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'Cho hàm số $y = x^3 - 3x^2 + 2$. Điểm cực đại của đồ thị hàm số là:',
            explanation: 'Đạo hàm $y\' = 3x^2 - 6x = 3x(x - 2)$. $y\' = 0 \\iff x = 0$ hoặc $x = 2$. Tại $x = 0$, $y\'$ đổi dấu từ dương sang âm nên điểm cực đại là $(0; 2)$.',
            difficulty: 'MEDIUM',
            orderIndex: 1,
            options: {
              create: [
                { content: '(0; 2)', isCorrect: true, orderIndex: 0 },
                { content: '(2; -2)', isCorrect: false, orderIndex: 1 },
                { content: '(1; 0)', isCorrect: false, orderIndex: 2 },
                { content: '(0; 0)', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'Tập xác định của hàm số $y = \\log_2 (x - 3)$ là:',
            explanation: 'Điều kiện xác định của $\\log_a b$ là biểu thức trong logarit $b > 0 \\iff x - 3 > 0 \\iff x > 3$. Do đó tập xác định là $(3; +\\infty)$.',
            difficulty: 'EASY',
            orderIndex: 2,
            options: {
              create: [
                { content: '(3; +\\infty)', isCorrect: true, orderIndex: 0 },
                { content: '[3; +\\infty)', isCorrect: false, orderIndex: 1 },
                { content: '(-\\infty; 3)', isCorrect: false, orderIndex: 2 },
                { content: '\\mathbb{R} \\setminus \\{3\\}', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  // Đề 10: Toán 12 Hình học Oxyz - HIGH_SCHOOL
  await prisma.exam.create({
    data: {
      title: 'Toán 12: Hình Học Không Gian Tọa Độ Oxyz & Khối Đa Diện',
      description: 'Luyện tập phương trình mặt phẳng $(\\alpha)$, phương trình đường thẳng $(d)$, khoảng cách và phương trình mặt cầu $(S)$ trong không gian $Oxyz$.',
      coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80',
      gradeLevel: 'HIGH_SCHOOL',
      subjectId: subMath.id,
      creatorId: teacherNam.id,
      creatorName: teacherNam.name,
      durationMinutes: 30,
      accessCode: '333002',
      isPublic: true,
      viewCount: 910,
      attemptCount: 390,
      questions: {
        create: [
          {
            content: 'Trong không gian $Oxyz$, cho mặt phẳng $(P): 2x - 3y + z - 5 = 0$. Một vectơ pháp tuyến của $(P)$ là:',
            explanation: 'Mặt phẳng $Ax + By + Cz + D = 0$ có vectơ pháp tuyến $\\vec{n} = (A; B; C) = (2; -3; 1)$.',
            difficulty: 'EASY',
            orderIndex: 0,
            options: {
              create: [
                { content: 'n = (2; -3; 1)', isCorrect: true, orderIndex: 0 },
                { content: 'n = (2; 3; 1)', isCorrect: false, orderIndex: 1 },
                { content: 'n = (-2; -3; 1)', isCorrect: false, orderIndex: 2 },
                { content: 'n = (2; -3; -5)', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'Tâm $I$ và bán kính $R$ của mặt cầu $(S): (x - 1)^2 + (y + 2)^2 + (z - 4)^2 = 25$ là:',
            explanation: 'Phương trình mặt cầu $(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2$ có tâm $I(a; b; c) = (1; -2; 4)$ và bán kính $R = \\sqrt{25} = 5$.',
            difficulty: 'EASY',
            orderIndex: 1,
            options: {
              create: [
                { content: 'I(1; -2; 4) và R = 5', isCorrect: true, orderIndex: 0 },
                { content: 'I(-1; 2; -4) và R = 5', isCorrect: false, orderIndex: 1 },
                { content: 'I(1; -2; 4) và R = 25', isCorrect: false, orderIndex: 2 },
                { content: 'I(-1; 2; -4) và R = 25', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  // Đề 11: Vật Lý 12 - HIGH_SCHOOL
  await prisma.exam.create({
    data: {
      title: 'Vật Lý 12: Dao Động Cơ & Sóng Cơ Học Điểm 8+ THPTQG',
      description: 'Chuyên đề dao động điều hòa, con lắc lò xo, con lắc đơn, giao thoa sóng cơ và sóng dừng kèm công thức tính chu kỳ, tần số.',
      coverImage: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600&auto=format&fit=crop&q=80',
      gradeLevel: 'HIGH_SCHOOL',
      subjectId: subPhysics.id,
      creatorId: teacherHoang.id,
      creatorName: teacherHoang.name,
      durationMinutes: 30,
      accessCode: '333003',
      isPublic: true,
      viewCount: 1050,
      attemptCount: 520,
      questions: {
        create: [
          {
            content: 'Một vật dao động điều hòa theo phương trình $x = 6\\cos(4\\pi t + \\frac{\\pi}{3})\\text{ (cm)}$. Tần số dao động $f$ của vật là:',
            explanation: 'Ta có $\\omega = 4\\pi\\text{ (rad/s)}$. Suy ra tần số $f = \\frac{\\omega}{2\\pi} = \\frac{4\\pi}{2\\pi} = 2\\text{ Hz}$.',
            difficulty: 'EASY',
            orderIndex: 0,
            options: {
              create: [
                { content: '2 Hz', isCorrect: true, orderIndex: 0 },
                { content: '4 Hz', isCorrect: false, orderIndex: 1 },
                { content: '0,5 Hz', isCorrect: false, orderIndex: 2 },
                { content: '4π Hz', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'Chu kỳ dao động điều hòa của con lắc đơn có chiều dài dây treo $l$ tại nơi có gia tốc trọng trường $g$ là:',
            explanation: 'Công thức chu kỳ con lắc đơn: $T = 2\\pi \\sqrt{\\frac{l}{g}}$.',
            difficulty: 'EASY',
            orderIndex: 1,
            options: {
              create: [
                { content: 'T = 2\\pi \\sqrt{\\frac{l}{g}}', isCorrect: true, orderIndex: 0 },
                { content: 'T = 2\\pi \\sqrt{\\frac{g}{l}}', isCorrect: false, orderIndex: 1 },
                { content: 'T = 2\\pi \\sqrt{\\frac{m}{k}}', isCorrect: false, orderIndex: 2 },
                { content: 'T = \\frac{1}{2\\pi} \\sqrt{\\frac{l}{g}}', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  // Đề 12: Hóa Học 12 - HIGH_SCHOOL
  await prisma.exam.create({
    data: {
      title: 'Hóa Học 12: Chuyên Đề Este, Lipit & Cacbohiđrat Trọng Tâm',
      description: 'Tổng hợp câu hỏi trắc nghiệm lý thuyết este, chất béo xà phòng hóa, glucozơ, fructozơ, saccarozơ và tinh bột.',
      coverImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=80',
      gradeLevel: 'HIGH_SCHOOL',
      subjectId: subChemistry.id,
      creatorId: teacherHoang.id,
      creatorName: teacherHoang.name,
      durationMinutes: 25,
      accessCode: '333004',
      isPublic: true,
      viewCount: 820,
      attemptCount: 410,
      questions: {
        create: [
          {
            content: 'Công thức phân tử tổng quát của este no, đơn chức, mạch hở là:',
            explanation: 'Este no, đơn chức, mạch hở có công thức tổng quát là $C_n H_{2n} O_2$ ($n \\ge 2$).',
            difficulty: 'EASY',
            orderIndex: 0,
            options: {
              create: [
                { content: 'CₙH₂ₙO₂ (n ≥ 2)', isCorrect: true, orderIndex: 0 },
                { content: 'CₙH₂ₙ₋₂O₂ (n ≥ 3)', isCorrect: false, orderIndex: 1 },
                { content: 'CₙH₂ₙO (n ≥ 1)', isCorrect: false, orderIndex: 2 },
                { content: 'CₙH₂ₙ₊₂O₂ (n ≥ 1)', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'Chất nào sau đây khi thủy phân trong môi trường axit chỉ tạo ra glucozơ?',
            explanation: 'Tinh bột và xenlulozơ khi thủy phân hoàn toàn trong môi trường axit chỉ tạo ra các phân tử $\\alpha$-glucozơ hoặc $\\beta$-glucozơ.',
            difficulty: 'MEDIUM',
            orderIndex: 1,
            options: {
              create: [
                { content: 'Tinh bột', isCorrect: true, orderIndex: 0 },
                { content: 'Saccarozơ', isCorrect: false, orderIndex: 1 },
                { content: 'Fructozơ', isCorrect: false, orderIndex: 2 },
                { content: 'Mantozo', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  // Đề 13: Sinh Học 12 - HIGH_SCHOOL
  await prisma.exam.create({
    data: {
      title: 'Sinh Học 12: Quy Luật Di Truyền Men-đen & Đột Biến Gen',
      description: 'Luyện tập quy luật phân ly, phân ly độc lập, đột biến điểm cấu trúc gen (thay thế, mất, thêm cặp nuclêôtit) và bài toán ADN.',
      coverImage: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=600&auto=format&fit=crop&q=80',
      gradeLevel: 'HIGH_SCHOOL',
      subjectId: subBiology.id,
      creatorId: teacherHoang.id,
      creatorName: teacherHoang.name,
      durationMinutes: 20,
      accessCode: '333005',
      isPublic: true,
      viewCount: 610,
      attemptCount: 260,
      questions: {
        create: [
          {
            content: 'Theo nguyên tắc bổ sung trong phân tử ADN mạch kép, kết luận nào sau đây luôn đúng?',
            explanation: 'Trong ADN mạch kép: $A = T$ và $G = X$. Do đó $A + G = T + X = 50\\%$.',
            difficulty: 'EASY',
            orderIndex: 0,
            options: {
              create: [
                { content: 'A + G = T + X', isCorrect: true, orderIndex: 0 },
                { content: 'A + T = G + X', isCorrect: false, orderIndex: 1 },
                { content: 'A = G và T = X', isCorrect: false, orderIndex: 2 },
                { content: 'A = X và T = G', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'Phép lai $Aa \\times Aa$ cho đời con có tỉ lệ kiểu hình phân ly theo tỉ lệ nào (biết gen A trội hoàn toàn so với a)?',
            explanation: 'Phép lai $Aa \\times Aa$ cho tỉ lệ kiểu gen $1AA : 2Aa : 1aa$, tương ứng tỉ lệ kiểu hình 3 trội : 1 lặn.',
            difficulty: 'EASY',
            orderIndex: 1,
            options: {
              create: [
                { content: '3 trội : 1 lặn', isCorrect: true, orderIndex: 0 },
                { content: '1 trội : 1 lặn', isCorrect: false, orderIndex: 1 },
                { content: '100% trội', isCorrect: false, orderIndex: 2 },
                { content: '1 trội : 2 trung gian : 1 lặn', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  // Đề 14: Tiếng Anh THPTQG - HIGH_SCHOOL
  await prisma.exam.create({
    data: {
      title: 'Tiếng Anh THPTQG: Chinh Phục Ngữ Âm, Trọng Âm & Đọc Điền Từ',
      description: 'Tổng hợp câu hỏi trọng điểm phân biệt thì, câu điều kiện loại 3, mệnh đề quan hệ rút gọn, thành ngữ idioms thường xuất hiện trong đề thi tốt nghiệp THPT.',
      coverImage: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=80',
      gradeLevel: 'HIGH_SCHOOL',
      subjectId: subEnglish.id,
      creatorId: teacherLinh.id,
      creatorName: teacherLinh.name,
      durationMinutes: 30,
      accessCode: '333006',
      isPublic: true,
      viewCount: 1350,
      attemptCount: 640,
      questions: {
        create: [
          {
            content: 'If she _______ harder during the course, she would have passed the university entrance exam.',
            explanation: 'Câu điều kiện loại 3 diễn tả giả định trái ngược với quá khứ: If + had + V3/ed, S + would have + V3/ed.',
            difficulty: 'MEDIUM',
            orderIndex: 0,
            options: {
              create: [
                { content: 'had studied', isCorrect: true, orderIndex: 0 },
                { content: 'studied', isCorrect: false, orderIndex: 1 },
                { content: 'studies', isCorrect: false, orderIndex: 2 },
                { content: 'would study', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'Hardly _______ into the room when the alarm went off.',
            explanation: 'Cấu trúc đảo ngữ: Hardly + had + S + V3/ed + when + S + V2/ed.',
            difficulty: 'HARD',
            orderIndex: 1,
            options: {
              create: [
                { content: 'had he stepped', isCorrect: true, orderIndex: 0 },
                { content: 'he had stepped', isCorrect: false, orderIndex: 1 },
                { content: 'did he step', isCorrect: false, orderIndex: 2 },
                { content: 'has he stepped', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  // Đề 15: Địa Lý 12 - HIGH_SCHOOL
  await prisma.exam.create({
    data: {
      title: 'Địa Lý 12: Địa Lý Tự Nhiên & Các Vùng Kinh Tế Trọng Điểm',
      description: 'Khảo sát khí hậu nhiệt đới ẩm gió mùa, địa hình bán bình nguyên, đồng bằng châu thổ và thế mạnh kinh tế vùng Tây Nguyên, Đông Nam Bộ.',
      coverImage: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&auto=format&fit=crop&q=80',
      gradeLevel: 'HIGH_SCHOOL',
      subjectId: subSocial.id,
      creatorId: teacherTrang.id,
      creatorName: teacherTrang.name,
      durationMinutes: 20,
      accessCode: '333007',
      isPublic: true,
      viewCount: 520,
      attemptCount: 220,
      questions: {
        create: [
          {
            content: 'Gió mùa Đông Bắc hoạt động ở nước ta chủ yếu trong khoảng thời gian nào và gây ra đặc điểm thời tiết gì ở miền Bắc?',
            explanation: 'Gió mùa Đông Bắc hoạt động từ tháng 11 đến tháng 4 năm sau, gây ra mùa đông lạnh ở miền Bắc với nửa đầu mùa khô ráo và nửa sau mùa có mưa phùn.',
            difficulty: 'EASY',
            orderIndex: 0,
            options: {
              create: [
                { content: 'Từ tháng 11 đến tháng 4 năm sau, gây mùa đông lạnh', isCorrect: true, orderIndex: 0 },
                { content: 'Từ tháng 5 đến tháng 10, gây mưa lớn trên diện rộng', isCorrect: false, orderIndex: 1 },
                { content: 'Quanh năm với tính chất nóng ẩm', isCorrect: false, orderIndex: 2 },
                { content: 'Chỉ hoạt động vào tháng 1 và 2', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  // =========================================================================
  // 8. CẤP ĐẠI HỌC & CHỨNG CHỈ (UNIVERSITY)
  // =========================================================================

  // Đề 16: JavaScript Web - UNIVERSITY
  await prisma.exam.create({
    data: {
      title: 'Lập Trình Web: JavaScript ES6, Scope & DOM API Căn Bản',
      description: 'Trắc nghiệm đánh giá kiến thức nền tảng: Arrow functions, Destructuring, Closure, Event Loop, Promise và Async/Await.',
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
      gradeLevel: 'UNIVERSITY',
      subjectId: subIT.id,
      creatorId: teacherDev.id,
      creatorName: teacherDev.name,
      durationMinutes: 20,
      accessCode: '444001',
      isPublic: true,
      viewCount: 1650,
      attemptCount: 780,
      questions: {
        create: [
          {
            content: 'Trong JavaScript, kết quả của biểu thức: `typeof null` là gì?',
            explanation: '`typeof null` trả về `"object"`. Đây là lỗi thiết kế lịch sử trong JavaScript được giữ lại để đảm bảo tương thích ngược.',
            difficulty: 'MEDIUM',
            orderIndex: 0,
            options: {
              create: [
                { content: '"object"', isCorrect: true, orderIndex: 0 },
                { content: '"null"', isCorrect: false, orderIndex: 1 },
                { content: '"undefined"', isCorrect: false, orderIndex: 2 },
                { content: '"boolean"', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'Phương thức nào trong mảng JavaScript trả về một mảng mới chỉ gồm các phần tử thỏa mãn điều kiện kiểm tra?',
            explanation: '`Array.prototype.filter()` duyệt qua mảng và trả về mảng mới chỉ chứa các phần tử mà callback trả về `true`.',
            difficulty: 'EASY',
            orderIndex: 1,
            options: {
              create: [
                { content: 'filter()', isCorrect: true, orderIndex: 0 },
                { content: 'map()', isCorrect: false, orderIndex: 1 },
                { content: 'forEach()', isCorrect: false, orderIndex: 2 },
                { content: 'reduce()', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  // Đề 17: Python - UNIVERSITY
  await prisma.exam.create({
    data: {
      title: 'Lập Trình Python: Cấu Trúc Dữ Liệu, List Comprehension & OOP',
      description: 'Đánh giá kiến thức ngôn ngữ lập trình Python: List, Tuple, Dictionary, Set, Lambda function, kế thừa class và xử lý ngoại lệ Try/Except.',
      coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      gradeLevel: 'UNIVERSITY',
      subjectId: subIT.id,
      creatorId: teacherDev.id,
      creatorName: teacherDev.name,
      durationMinutes: 25,
      accessCode: '444002',
      isPublic: true,
      viewCount: 1120,
      attemptCount: 530,
      questions: {
        create: [
          {
            content: 'Trong Python, kiểu dữ liệu nào dưới đây là bất biến (immutable)?',
            explanation: '`tuple`, `int`, `float`, `str` là các kiểu dữ liệu immutable trong Python; trong khi `list`, `dict`, `set` là mutable.',
            difficulty: 'EASY',
            orderIndex: 0,
            options: {
              create: [
                { content: 'tuple', isCorrect: true, orderIndex: 0 },
                { content: 'list', isCorrect: false, orderIndex: 1 },
                { content: 'dictionary', isCorrect: false, orderIndex: 2 },
                { content: 'set', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'Kết quả của biểu thức: `[x**2 for x in range(4) if x % 2 == 0]` là:',
            explanation: '`range(4)` gồm các số `[0, 1, 2, 3]`. Các số chẵn là 0 và 2. Bình phương lên ta được `[0**2, 2**2]` tức là `[0, 4]`.',
            difficulty: 'MEDIUM',
            orderIndex: 1,
            options: {
              create: [
                { content: '[0, 4]', isCorrect: true, orderIndex: 0 },
                { content: '[0, 1, 4, 9]', isCorrect: false, orderIndex: 1 },
                { content: '[4]', isCorrect: false, orderIndex: 2 },
                { content: '[0, 2]', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  // Đề 18: SQL - UNIVERSITY
  await prisma.exam.create({
    data: {
      title: 'Cơ Sở Dữ Liệu: Truy Vấn SQL, Khóa Chính, Index & JOIN',
      description: 'Bộ trắc nghiệm chuyên sâu về thiết kế CSDL quan hệ: Phân biệt INNER JOIN vs LEFT JOIN, GROUP BY, HAVING và tối ưu hóa câu truy vấn.',
      coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80',
      gradeLevel: 'UNIVERSITY',
      subjectId: subIT.id,
      creatorId: teacherDev.id,
      creatorName: teacherDev.name,
      durationMinutes: 20,
      accessCode: '444003',
      isPublic: true,
      viewCount: 940,
      attemptCount: 460,
      questions: {
        create: [
          {
            content: 'Mệnh đề nào trong SQL được dùng để lọc điều kiện sau khi đã gom nhóm bằng GROUP BY?',
            explanation: '`WHERE` dùng để lọc bản ghi trước khi gom nhóm; còn `HAVING` dùng để lọc các nhóm sau khi đã gom bằng `GROUP BY`.',
            difficulty: 'EASY',
            orderIndex: 0,
            options: {
              create: [
                { content: 'HAVING', isCorrect: true, orderIndex: 0 },
                { content: 'WHERE', isCorrect: false, orderIndex: 1 },
                { content: 'ORDER BY', isCorrect: false, orderIndex: 2 },
                { content: 'LIMIT', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'Phép nối nào (JOIN) trả về tất cả các hàng từ bảng bên trái cùng với các hàng khớp từ bảng bên phải, nếu không khớp sẽ trả về NULL?',
            explanation: '`LEFT JOIN` (hay `LEFT OUTER JOIN`) giữ lại toàn bộ các bản ghi của bảng bên trái kể cả khi không tìm thấy kết quả khớp ở bảng bên phải.',
            difficulty: 'EASY',
            orderIndex: 1,
            options: {
              create: [
                { content: 'LEFT JOIN', isCorrect: true, orderIndex: 0 },
                { content: 'INNER JOIN', isCorrect: false, orderIndex: 1 },
                { content: 'RIGHT JOIN', isCorrect: false, orderIndex: 2 },
                { content: 'CROSS JOIN', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  // Đề 19: TOEIC Reading - UNIVERSITY
  await prisma.exam.create({
    data: {
      title: 'Luyện Thi TOEIC Reading: Ngữ Pháp & Từ Vựng Part 5 Cốt Lõi',
      description: 'Luyện kỹ năng phân biệt từ loại (Danh từ, Động từ, Tính từ, Trạng từ), liên từ và giới từ thương mại thường gặp trong bài thi TOEIC 650+.',
      coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
      gradeLevel: 'UNIVERSITY',
      subjectId: subEnglish.id,
      creatorId: teacherLinh.id,
      creatorName: teacherLinh.name,
      durationMinutes: 20,
      accessCode: '444004',
      isPublic: true,
      viewCount: 1280,
      attemptCount: 610,
      questions: {
        create: [
          {
            content: 'The board of directors voted _______ to approve the proposed merger with Zenith Corp.',
            explanation: 'Cần một trạng từ (adverb) để bổ nghĩa cho động từ "voted". "Unanimously" mang nghĩa "một cách nhất trí, đồng lòng".',
            difficulty: 'MEDIUM',
            orderIndex: 0,
            options: {
              create: [
                { content: 'unanimously', isCorrect: true, orderIndex: 0 },
                { content: 'unanimous', isCorrect: false, orderIndex: 1 },
                { content: 'unanimity', isCorrect: false, orderIndex: 2 },
                { content: 'unanimousness', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            content: 'Please submit your quarterly expense report _______ Friday afternoon at the latest.',
            explanation: '"by + mốc thời gian" mang ý nghĩa là "trước hoặc muộn nhất vào thời điểm đó".',
            difficulty: 'EASY',
            orderIndex: 1,
            options: {
              create: [
                { content: 'by', isCorrect: true, orderIndex: 0 },
                { content: 'until', isCorrect: false, orderIndex: 1 },
                { content: 'for', isCorrect: false, orderIndex: 2 },
                { content: 'since', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  // Đề 20: Triết học Mác - Lênin - UNIVERSITY
  await prisma.exam.create({
    data: {
      title: 'Triết Học Mác - Lênin: Nguyên Lý Về Mối Liên Hệ Phổ Biến & Quy Luật',
      description: 'Khảo sát kiến thức triết học đại cương bậc đại học: Hai nguyên lý, sáu cặp phạm trù và ba quy luật cơ bản của phép biện chứng duy vật.',
      coverImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80',
      gradeLevel: 'UNIVERSITY',
      subjectId: subSocial.id,
      creatorId: teacherTrang.id,
      creatorName: teacherTrang.name,
      durationMinutes: 15,
      accessCode: '444005',
      isPublic: true,
      viewCount: 810,
      attemptCount: 380,
      questions: {
        create: [
          {
            content: 'Quy luật nào được V.I.Lênin coi là "hạt nhân của phép biện chứng duy vật"?',
            explanation: 'Quy luật thống nhất và đấu tranh giữa các mặt đối lập (quy luật mâu thuẫn) chỉ ra nguồn gốc, động lực bên trong của mọi sự vận động và phát triển.',
            difficulty: 'EASY',
            orderIndex: 0,
            options: {
              create: [
                { content: 'Quy luật thống nhất và đấu tranh của các mặt đối lập', isCorrect: true, orderIndex: 0 },
                { content: 'Quy luật chuyển hóa từ những sự thay đổi về lượng thành những thay đổi về chất', isCorrect: false, orderIndex: 1 },
                { content: 'Quy luật phủ định của phủ định', isCorrect: false, orderIndex: 2 },
                { content: 'Quy luật quan hệ sản xuất phù hợp với trình độ phát triển của lực lượng sản xuất', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('🎉 Hoàn thành xuất sắc: Đã tạo 20 bộ đề thi đa dạng, phong phú bao phủ đầy đủ 4 cấp học!');
  console.log('- 🎒 Cấp 1 (Tiểu học): 3 đề thi (Toán 5, Tiếng Việt 5, Tiếng Anh Tiểu học)');
  console.log('- 📘 Cấp 2 (THCS): 5 đề thi (Toán 9, Ngữ Văn 9, Tiếng Anh 9, KHTN 8, Lịch Sử 9)');
  console.log('- 🎓 Cấp 3 (THPT): 7 đề thi (Toán 12 Giải tích, Oxyz, Vật Lý 12, Hóa 12, Sinh 12, Anh THPTQG, Địa 12)');
  console.log('- 💼 Đại học & Chứng chỉ: 5 đề thi (JavaScript, Python, CSDL SQL, TOEIC Reading, Triết học Mác-Lênin)');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
