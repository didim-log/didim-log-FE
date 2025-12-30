import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '../components/layout/DashboardLayout'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Modal from '../components/common/Modal'
import { Loading } from '../components/common/Loading'
import { getUsers, deleteUser, updateUser } from '../apis/adminApi'
import { getErrorMessage } from '../utils/errorHandler'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '../types/api/error'
import type { AdminUserResponse, AdminUserUpdateDto } from '../types/api/dtos'
import { Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 20

export default function AdminPage() {
    const [currentPage, setCurrentPage] = useState(1)
    const [editingUser, setEditingUser] = useState<AdminUserResponse | null>(null)
    const [editForm, setEditForm] = useState<AdminUserUpdateDto>({})
    const queryClient = useQueryClient()

    // 회원 목록 조회
    const {
        data: usersData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['adminUsers', currentPage],
        queryFn: () => getUsers(currentPage, PAGE_SIZE),
        retry: 1,
    })

    // 회원 삭제 Mutation
    const deleteUserMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            toast.success('회원이 성공적으로 탈퇴되었습니다.')
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
        },
        onError: (err: AxiosError<ApiErrorResponse>) => {
            const errorMessage = err.response?.data
                ? getErrorMessage(err.response.data)
                : '회원 삭제에 실패했습니다.'
            toast.error(errorMessage)
        },
    })

    // 회원 수정 Mutation
    const updateUserMutation = useMutation({
        mutationFn: ({ studentId, updateDto }: { studentId: string; updateDto: AdminUserUpdateDto }) =>
            updateUser(studentId, updateDto),
        onSuccess: () => {
            toast.success('회원 정보가 수정되었습니다.')
            setEditingUser(null)
            setEditForm({})
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
        },
        onError: (err: AxiosError<ApiErrorResponse>) => {
            const errorMessage = err.response?.data
                ? getErrorMessage(err.response.data)
                : '회원 정보 수정에 실패했습니다.'
            toast.error(errorMessage)
        },
    })

    const handleEditClick = (user: AdminUserResponse) => {
        setEditingUser(user)
        // role을 ROLE_ 접두사가 있는 형식으로 변환 (요청 시 필요)
        const roleWithPrefix = user.role.startsWith('ROLE_') ? user.role : `ROLE_${user.role}`
        setEditForm({
            nickname: user.nickname,
            role: roleWithPrefix,
            bojId: user.bojId || '',
        })
    }

    const handleEditSubmit = () => {
        if (!editingUser) return

        // 변경사항이 있는지 확인 (role 비교 시 접두사 고려)
        const userRoleWithPrefix = editingUser.role.startsWith('ROLE_')
            ? editingUser.role
            : `ROLE_${editingUser.role}`
        const hasChanges =
            editForm.nickname !== editingUser.nickname ||
            editForm.role !== userRoleWithPrefix ||
            editForm.bojId !== (editingUser.bojId || '')

        if (!hasChanges) {
            toast.info('변경사항이 없습니다.')
            return
        }

        // 빈 값 제거
        const updateDto: AdminUserUpdateDto = {}
        if (editForm.nickname && editForm.nickname !== editingUser.nickname) {
            updateDto.nickname = editForm.nickname.trim()
        }
        // role 변경 확인 (접두사 고려)
        const userRoleWithPrefix = editingUser.role.startsWith('ROLE_')
            ? editingUser.role
            : `ROLE_${editingUser.role}`
        if (editForm.role && editForm.role !== userRoleWithPrefix) {
            updateDto.role = editForm.role
        }
        if (editForm.bojId !== undefined && editForm.bojId !== (editingUser.bojId || '')) {
            updateDto.bojId = editForm.bojId.trim() || undefined
        }

        if (Object.keys(updateDto).length === 0) {
            toast.info('변경사항이 없습니다.')
            return
        }

        updateUserMutation.mutate({
            studentId: editingUser.id,
            updateDto,
        })
    }

    const handleDeleteClick = (user: AdminUserResponse) => {
        const confirmed = window.confirm(
            `정말 "${user.nickname}" 회원을 탈퇴시키시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
        )
        if (!confirmed) return

        deleteUserMutation.mutate(user.id)
    }

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && usersData && newPage <= usersData.totalPages) {
            setCurrentPage(newPage)
        }
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center min-h-[400px]">
                    <Loading />
                </div>
            </DashboardLayout>
        )
    }

    if (error) {
        const errorMessage = error instanceof AxiosError && error.response?.data
            ? getErrorMessage(error.response.data)
            : '회원 목록을 불러오는데 실패했습니다.'
        return (
            <DashboardLayout>
                <Card>
                    <div className="p-8 text-center">
                        <p className="text-red-600 dark:text-red-400">{errorMessage}</p>
                    </div>
                </Card>
            </DashboardLayout>
        )
    }

    const users = usersData?.content || []
    const totalPages = usersData?.totalPages || 0
    const totalElements = usersData?.totalElements || 0

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        회원 관리
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        총 {totalElements}명의 회원
                    </p>
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        닉네임
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        BOJ ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        이메일
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        제공자
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        권한
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        티어
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Rating
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        연속 풀이
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        작업
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            회원이 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                        >
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                                {user.nickname}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                {user.bojId || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                {user.email || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                {user.provider}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        user.role === 'ADMIN'
                                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                            : user.role === 'USER'
                                                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                    }`}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                {user.currentTier}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                {user.rating}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                {user.consecutiveSolveDays}일
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEditClick(user)}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <Edit className="w-3 h-3" />
                                                        수정
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(user)}
                                                        disabled={deleteUserMutation.isPending}
                                                        className="flex items-center gap-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                        삭제
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* 페이징 */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {currentPage} / {totalPages} 페이지
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={!usersData?.hasPrevious || currentPage === 1}
                                    className="flex items-center gap-1"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    이전
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={!usersData?.hasNext || currentPage === totalPages}
                                    className="flex items-center gap-1"
                                >
                                    다음
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* 수정 모달 */}
            <Modal
                isOpen={editingUser !== null}
                onClose={() => {
                    setEditingUser(null)
                    setEditForm({})
                }}
                title="회원 정보 수정"
                className="max-w-lg"
                footer={
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setEditingUser(null)
                                setEditForm({})
                            }}
                            disabled={updateUserMutation.isPending}
                        >
                            취소
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleEditSubmit}
                            disabled={updateUserMutation.isPending}
                            isLoading={updateUserMutation.isPending}
                        >
                            저장
                        </Button>
                    </div>
                }
            >
                {editingUser && (
                    <div className="space-y-4">
                        <Input
                            label="닉네임"
                            type="text"
                            value={editForm.nickname || ''}
                            onChange={(e) =>
                                setEditForm({ ...editForm, nickname: e.target.value })
                            }
                            placeholder="닉네임을 입력하세요"
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                권한
                            </label>
                            <select
                                value={editForm.role || ''}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, role: e.target.value })
                                }
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            >
                                <option value="ROLE_USER">ROLE_USER</option>
                                <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                            </select>
                        </div>

                        <Input
                            label="BOJ ID"
                            type="text"
                            value={editForm.bojId || ''}
                            onChange={(e) =>
                                setEditForm({ ...editForm, bojId: e.target.value })
                            }
                            placeholder="BOJ ID를 입력하세요 (선택사항)"
                            helperText="소셜 로그인 사용자의 경우 BOJ ID를 추가할 수 있습니다"
                        />
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    )
}






