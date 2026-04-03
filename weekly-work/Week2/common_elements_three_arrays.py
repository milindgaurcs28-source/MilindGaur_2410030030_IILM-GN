class Solution:
    def commonElements(self, A, B, C):
        i = j = k = 0
        result = []
        
        while i < len(A) and j < len(B) and k < len(C):
            if A[i] == B[j] == C[k]:
                if not result or result[-1] != A[i]:
                    result.append(A[i])
                i += 1
                j += 1
                k += 1
            elif A[i] < B[j]:
                i += 1
            elif B[j] < C[k]:
                j += 1
            else:
                k += 1
        
        return result if result else [-1]

# Time Complexity: O(n1 + n2 + n3)
# Space Complexity: O(1)
