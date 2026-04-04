import { useState } from 'react';
import { HelpCircle, Trophy, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { IQuizQuestion } from '@/types';

interface Props {
    questions: IQuizQuestion[];
    // 💡 SỬA: onPass bây giờ bắt buộc trả về một con số (điểm)
    onPass: (score: number) => void;
    passPercent?: number;
}

export default function QuizView({ questions, onPass, passPercent = 80 }: Props) {
    const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const handleSelect = (qIndex: number, optIndex: number) => {
        if (submitted) return;
        const newAns = [...answers];
        newAns[qIndex] = optIndex;
        setAnswers(newAns);
    };

    const handleSubmit = () => {
        let correct = 0;
        questions.forEach((q, i) => {
            if (answers[i] === q.correctAnswer) correct++;
        });
        const finalScore = Math.round((correct / questions.length) * 100);
        setScore(finalScore);
        setSubmitted(true);

        if (finalScore >= passPercent) {
            // 💡 QUAN TRỌNG: Gửi điểm số lên component cha
            onPass(finalScore);
            toast.success(`Xuất sắc! Bạn đạt ${finalScore}%`);
        } else {
            toast.error(`Bạn đạt ${finalScore}%. Cần tối thiểu ${passPercent}% để qua bài.`);
        }
    };

    const handleRetry = () => {
        setAnswers(new Array(questions.length).fill(-1));
        setSubmitted(false);
        setScore(0);
    };

    return (
        <div className="max-w-3xl mx-auto p-6 md:p-10">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <HelpCircle className="text-purple-600" /> Bài kiểm tra kiến thức
                    </h2>
                    <span className="bg-purple-100 text-purple-700 text-sm font-bold px-3 py-1 rounded-full">
                        Học viên đạt khi làm đúng: {passPercent}%
                    </span>
                </div>

                {!submitted ? (
                    <div className="space-y-8">
                        {questions.map((q, qIdx) => (
                            <div key={qIdx} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="font-bold text-gray-800 mb-3">Câu {qIdx + 1}: {q.question}</p>
                                <div className="space-y-2">
                                    {q.options.map((opt: string, oIdx: number) => (
                                        <div
                                            key={oIdx}
                                            onClick={() => handleSelect(qIdx, oIdx)}
                                            className={`p-3 rounded border cursor-pointer transition flex items-center gap-3 ${answers[qIdx] === oIdx
                                                ? 'bg-purple-100 border-purple-500 text-purple-900'
                                                : 'bg-white border-gray-200 hover:bg-gray-100'
                                                }`}
                                        >
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${answers[qIdx] === oIdx ? 'border-purple-600 bg-purple-600' : 'border-gray-400'}`}>
                                                {answers[qIdx] === oIdx && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={handleSubmit}
                            disabled={answers.includes(-1)}
                            className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
                        >
                            Nộp bài
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <div className="mb-4 inline-block p-4 rounded-full bg-gray-100">
                            {score >= passPercent ? <Trophy className="w-16 h-16 text-yellow-500" /> : <Loader2 className="w-16 h-16 text-gray-400" />}
                        </div>
                        <h3 className="text-4xl font-bold text-gray-900 mb-2">{score}%</h3>
                        <p className={`text-lg mb-8 ${score >= passPercent ? 'text-green-600 font-bold' : 'text-red-500'}`}>
                            {score >= passPercent ? 'Bạn đã vượt qua bài kiểm tra!' : 'Chưa đạt yêu cầu. Hãy thử lại nhé.'}
                        </p>

                        {score < passPercent && (
                            <button onClick={handleRetry} className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition">
                                Làm lại bài thi
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}