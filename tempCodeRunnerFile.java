import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int[] num = {2,4,1,6,7,5};
        int[] res = findPeaks(num);
        for (int index:res){
        	System.out.print(index + " ");
        }
    }
    
    public static int[] findPeaks(int[] num){
        int count = 0;
        for (int i = 1; i < num.length; i++){
        	if (num[i] > num[i -1] && num[i] > num[i+1]){
                count++;
            }
        }
        int[] peaks = new int[count];
        int index = 0;
        for (int i = 1; i < num.length; i++){
        	if (num[i] > num[i-1] && num[i] > num[i+1]){
            	peaks[index++]=i;
        	}
        }
        return peaks;    
    }
              
}
    


      
             
