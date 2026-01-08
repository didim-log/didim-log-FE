import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import type { BojVerifyErrorGuide as BojVerifyErrorGuideModel } from '../utils/bojVerifyError';

interface BojVerifyErrorGuideProps {
    guide: BojVerifyErrorGuideModel;
}

const isExternalUrl = (url: string): boolean => {
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//');
};

export const BojVerifyErrorGuide: FC<BojVerifyErrorGuideProps> = ({ guide }) => {
    return (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">{guide.title}</p>
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{guide.description}</p>
            <ol className="mt-3 list-decimal list-inside space-y-1 text-xs text-red-700 dark:text-red-300">
                {guide.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                ))}
            </ol>
            {guide.links && guide.links.length > 0 && (
                <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-700">
                    <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-2">관련 링크:</p>
                    <div className="flex flex-wrap gap-2">
                        {guide.links.map((link, index) => {
                            if (isExternalUrl(link.url)) {
                                return (
                                    <a
                                        key={index}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium"
                                    >
                                        {link.text}
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                );
                            }
                            return (
                                <Link
                                    key={index}
                                    to={link.url}
                                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium"
                                >
                                    {link.text}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
