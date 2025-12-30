/**
 * 문제 크롤링 제어 컴포넌트
 */

import { useState } from 'react';
import { useCollectMetadata, useCollectDetails } from '../../../hooks/api/useAdmin';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export const ProblemCollector: React.FC = () => {
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');

    const collectMetadataMutation = useCollectMetadata();
    const collectDetailsMutation = useCollectDetails();

    const handleCollectMetadata = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!start || !end) {
            alert('시작 문제 ID와 종료 문제 ID를 입력해주세요.');
            return;
        }

        const startNum = Number(start);
        const endNum = Number(end);

        if (isNaN(startNum) || isNaN(endNum) || startNum < 1 || endNum < 1 || startNum > endNum) {
            alert('유효한 문제 ID 범위를 입력해주세요.');
            return;
        }

        try {
            await collectMetadataMutation.mutateAsync({ start: startNum, end: endNum });
            alert('문제 메타데이터 수집이 완료되었습니다.');
            setStart('');
            setEnd('');
        } catch (error) {
            console.error('Collect metadata failed:', error);
            alert('수집에 실패했습니다.');
        }
    };

    const handleCollectDetails = async () => {
        if (!confirm('문제 상세 정보 크롤링을 시작하시겠습니까? 시간이 오래 걸릴 수 있습니다.')) {
            return;
        }

        try {
            await collectDetailsMutation.mutateAsync();
            alert('문제 상세 정보 크롤링이 완료되었습니다.');
        } catch (error) {
            console.error('Collect details failed:', error);
            alert('크롤링에 실패했습니다.');
        }
    };

    return (
        <div className="space-y-6">
            {/* 메타데이터 수집 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">문제 메타데이터 수집</h2>
                <form onSubmit={handleCollectMetadata} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="시작 문제 ID"
                            type="number"
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                            placeholder="예: 1000"
                            min={1}
                            required
                        />
                        <Input
                            label="종료 문제 ID"
                            type="number"
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                            placeholder="예: 1100"
                            min={1}
                            required
                        />
                    </div>
                    <Button type="submit" variant="primary" isLoading={collectMetadataMutation.isPending}>
                        메타데이터 수집 시작
                    </Button>
                </form>
            </div>

            {/* 상세 정보 크롤링 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">문제 상세 정보 크롤링</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    DB에서 descriptionHtml이 null인 문제들의 상세 정보를 백준 사이트에서 크롤링하여 업데이트합니다.
                </p>
                <Button onClick={handleCollectDetails} variant="primary" isLoading={collectDetailsMutation.isPending}>
                    상세 정보 크롤링 시작
                </Button>
            </div>
        </div>
    );
};

